const { Op, where, NUMBER } = require("sequelize");
const db = require("../models/db.model");
const ApiError = require("../utils/apiError");
const { createNotification } = require("../src/service/notification");

const Address = db.address;
const Product = db.products;
const Order = db.orders;
const OrderItem = db.orderitems;
const UserCart = db.usercarts;
const Users = db.users;
const Commission = db.commissions;
const TxnCommission = db.txncommissions;
const OrderPayment = db.orderpayments;
const OrderService = () => {
  const orderCreate = async (req) => {
    let order; // 🔑 transaction ke bahar use hoga
    const t = await db.sequelize.transaction();

    try {
      const { products } = req.body;

      if (!products || products.length === 0) {
        throw new ApiError(400, "प्रोडक्ट अनिवार्य है");
      }

      let totalAmt = 0;
      const orderItemsData = [];

      for (let item of products) {
        const { PID, quantity } = item;

        if (!PID || !quantity || quantity <= 0) {
          throw new ApiError(400, "अमान्य पीआईडी या मात्रा");
        }

        const product = await Product.findOne({
          where: { PID, status: "Active" },
        });

        if (!product) {
          throw new ApiError(400, `प्रोडक्ट नहीं मिला: ${PID}`);
        }

        const price = product.price;
        totalAmt += price * quantity;

        orderItemsData.push({
          PID,
          quantity,
          price,
          MRP: product.MRP,
        });

        await product.decrement("quantity", { by: quantity, transaction: t });
      }

      // 🔹 Order create
      order = await Order.create(
        {
          orderFrom: req.user.id,
          totalAmt,
          orderStatus: "pending",
          paymentStatus: "unpaid",
        },
        { transaction: t }
      );

      // 🔹 Order items
      for (let item of orderItemsData) {
        await OrderItem.create(
          {
            ...item,
            orderId: order.orderId,
          },
          { transaction: t }
        );
      }

      // 🔹 Cart clear
      const productId = products.map((p) => p.PID);
      await UserCart.destroy({
        where: {
          userId: req.user.id,
          PID: { [Op.in]: productId },
        },
        transaction: t,
      });

      await t.commit(); // ✅ transaction END
    } catch (error) {
      await t.rollback(); // ✅ rollback only here
      throw error;
    }

    // ================= OUTSIDE TRANSACTION =================
    try {
      let agencyName = "Agency";

      const agent = await Users.findOne({
        where: { id: req.user.id },
        attributes: ["generatedBy"],
      });

      if (agent?.generatedBy) {
        const agency = await Users.findOne({
          where: { id: agent.generatedBy },
          attributes: ["name"], // ❗ typo fixed
        });
        agencyName = agency?.name || agencyName;
      }

      const manufacturer = await Users.findOne({
        where: {
          userType: "Manufacturer",
          status: "Active",
          deletedAt: null,
        },
        attributes: ["id", "name", "email"],
      });

      if (manufacturer) {
        // 🔔 Firebase notification
        await createNotification({
          receiverId: manufacturer.id,
          senderId: req.user.id,
          title: `${req.user.name} द्वारा नया ऑर्डर प्राप्त हुआ`,
          message: `${req.user.name} (${agencyName}) ने ₹${order.totalAmt} का नया ऑर्डर किया है`,
          orderId: order.orderId,
        });

        // 📧 Email notification
        if (manufacturer.email) {
          await sendMail({
            to: manufacturer.email,
            subject: "नया ऑर्डर प्राप्त हुआ",
            html: `
            <h3>नया ऑर्डर प्राप्त हुआ</h3>
            <p><b>एजेंट:</b> ${req.user.name}</p>
            <p><b>एजेंसी:</b> ${agencyName}</p>
            <p><b>ऑर्डर ID:</b> ${order.orderId}</p>
            <p><b>राशि:</b> ₹${order.totalAmt}</p>
            <h4>${process.env.FRONTEND_URL}/sales-history>"इस लिंक पर क्लिक करके अपना ऑर्डर देखें" ✅</h4>
          `,
          });
        }
      }
    } catch (err) {
      console.error("Notification / Email error:", err.message);
    }

    req.result = { order };
  };
  const getOrderHistory = async (req) => {
    const loginUser = req.user;
    const { startDate, endDate, status, orderId, userId, page, limit } =
      req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;

    const whereCondition = {};
    if (orderId) whereCondition.orderId = orderId;
    if (status) whereCondition.orderStatus = status;
    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.orderDate = { [Op.between]: [start, end] };
    } else {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      whereCondition.orderDate = { [Op.between]: [startOfDay, endOfDay] };
    }
    if (userId) {
      whereCondition.orderFrom = userId;
    }
    if (loginUser.userType === "Agent") {
      whereCondition.orderFrom = loginUser.id;
    } else if (loginUser.userType === "Agency") {
      const agents = await Users.findAll({
        where: { generatedBy: loginUser.id, userType: "Agent" },
        attributes: ["id"],
      });
      const agentIds = agents.map((a) => a.id);
      whereCondition.orderFrom = { [Op.in]: agentIds };
      if (!status) {
        whereCondition.orderStatus = { [Op.not]: "pending" };
      }
      if (userId) {
        whereCondition.orderFrom = userId;
      }
    }
    const { count, rows: order } = await Order.findAndCountAll({
      where: whereCondition,
      order: [["orderId", "DESC"]],
      include: [{ model: Users, attributes: ["id", "name", "mobileNo"] }],
      limit: Limit,
      offset,
    });
    const totalOrders = await Order.count({
      where: { orderFrom: req.user.id },
    });
    req.result = {
      totalData: count || 0,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      totalOrders,
      order,
    };
  };
  const getOrderDetails = async (req) => {
    const { orderId } = req.query;
    if (!orderId) throw new ApiError(400, "ऑर्डर आईडी अनिवार्य है");
    const orderdetails = await Order.findOne({
      where: { orderId },
      include: [
        { model: Users, include: [{ model: Address, as: "address" }] },
        {
          model: OrderItem,
          as: "orderitems",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });
    req.result = { orderdetails };
  };
  const updateOrderStatus = async (req) => {
    const { orderId, orderStatus, reason, amount } = req.body;
    const user = req.user;
    const userId = user.id;
    const userType = user.userType;
    const order = await Order.findOne({ where: { orderId } });
    if (!order) throw new ApiError(400, "ऑर्डर नहीं मिला");
    if (amount !== undefined && Number(amount) > 0) {
      const oldPaid = Number(order.balance || 0);
      const newPaid = oldPaid + Number(amount);
      if (newPaid > Number(order.totalAmt)) {
        throw new ApiError(
          400,
          "पेमेंट एमाउंट टोटल एमाउंट से ज़्यादा नहीं हो सकता"
        );
      }
      order.balance = newPaid;

      if (newPaid == 0) {
        order.paymentStatus = "unpaid";
      } else if (newPaid < order.totalAmt) {
        order.paymentStatus = "partial_paid";
      } else if (newPaid == order.totalAmt) {
        order.paymentStatus = "paid";
      } else {
        order.paymentStatus = "unpaid";
      }
      await OrderPayment.create({
        orderId: order.orderId,
        paidAmount: amount,
        paidBy: userId,
      });
    }
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (reason) order.reason = reason;
    if (orderStatus === "confirmed") {
      order.confirmationDate = new Date();
    }
    await order.save();
    // =====================================================
    // 🔑 ID RESOLUTION (Agent → Agency → Manufacturer)
    // =====================================================
    const agentId = order.orderFrom; // Agent who placed order

    let agencyId = null;
    let manufacturerId = null;
    let agentName = "Agent";
    let agencyName = "Agency";
    let manufacturerName = "Manufacturer";
    const orderAmountText = `₹${order.totalAmt} का order`;
    const reasonText = reason ? ` कारण: ${reason}` : "";

    // 1️⃣ Agent → Agency
    if (agentId) {
      const agent = await Users.findOne({
        where: { id: agentId },
        attributes: ["name", "generatedBy"],
      });
      agentName = agent?.name || agentName;
      agencyId = agent?.generatedBy || null;
    }

    // 2️⃣ Agency → Manufacturer
    if (agencyId) {
      const agency = await Users.findOne({
        where: { id: agencyId },
        attributes: ["name", "generatedBy"],
      });
      agencyName = agency?.name || agencyName;
      manufacturerId = agency?.generatedBy || null;
    }

    if (manufacturerId) {
      const manufacturer = await Users.findOne({
        where: { id: manufacturerId },
        attributes: ["name"],
      });
      manufacturerName = manufacturer?.name || manufacturerName;
    }
    // =====================================================
    // 🔔 NOTIFICATIONS
    // =====================================================
    // ✅ Manufacturer confirms order
    if (userType === "Manufacturer" && orderStatus === "confirmed") {
      if (agentId) {
        await createNotification({
          receiverId: agentId,
          senderId: userId,
          title: "ऑर्डर कन्फर्म हो गया",
          message: `${manufacturerName} ने आपका ${orderAmountText} confirm किया है।`,
          orderId,
        });
      }

      if (agencyId) {
        await createNotification({
          receiverId: agencyId,
          senderId: userId,
          title: "ऑर्डर कन्फर्म हो गया",
          message: `${manufacturerName} ने ${agentName} का ${orderAmountText} confirm किया है।`,
          orderId,
        });
      }
    }

    // ✅ Agency dispatch / ready_to_dispatch
    if (
      userType === "Agency" &&
      (orderStatus === "dispatched" || orderStatus === "ready_to_dispatch")
    ) {
      if (agentId) {
        await createNotification({
          receiverId: agentId,
          senderId: userId,
          title: "ऑर्डर अपडेट हो गया",
          message: `${agencyName} ने आपका ${orderAmountText} "${orderStatus}" कर दिया है।`,
          orderId,
        });
      }

      if (manufacturerId) {
        await createNotification({
          receiverId: manufacturerId,
          senderId: userId,
          title: "ऑर्डर डिस्पैच अपडेट",
          message: `${agencyName} ने ${agentName} का ${orderAmountText} "${orderStatus}" किया है।`,
          orderId,
        });
      }
    }

    // ✅ Agency delivered
    if (userType === "Agency" && orderStatus === "delivered") {
      if (manufacturerId) {
        await createNotification({
          receiverId: manufacturerId,
          senderId: userId,
          title: "ऑर्डर डिलीवर हो गया",
          message: `${agencyName} ने ${agentName} का ${orderAmountText} डिलीवर मार्क किया है।`,
          orderId,
          isDelivered: false,
        });
      }

      if (agentId) {
        await createNotification({
          receiverId: agentId,
          senderId: userId,
          title: "ऑर्डर डिलीवर हो गया",
          message: `${agencyName} ने आपका ${orderAmountText} सफलतापूर्वक डिलीवर कर दिया है।`,
          orderId,
        });
      }
    }

    if (userType === "Agent" && orderStatus === "cancelled") {
      if (agencyId) {
        await createNotification({
          receiverId: agencyId,
          senderId: userId,
          title: "ऑर्डर कैंसिल हो गया",
          message: `${agentName} ने अपना ${orderAmountText} रद्द कर दिया है।${reasonText}`,
          orderId,
        });
      }
      if (manufacturerId) {
        await createNotification({
          receiverId: manufacturerId,
          senderId: userId,
          title: "ऑर्डर कैंसिल हो गया",
          message: `${agentName}(${agencyName}) ने अपना ${orderAmountText} रद्द कर दिया है।${reasonText}`,
          orderId,
        });
      }
    }
    if (userType === "Manufacturer" && orderStatus === "rejected") {
      if (agentId) {
        await createNotification({
          receiverId: agentId,
          senderId: userId,
          title: "ऑर्डर रिजेक्ट हो गया",
          message: `${manufacturerName} ने आपका ${orderAmountText} रिजेक्ट कर दिया है।${reasonText}`,
          orderId,
        });
      }
      if (agencyId) {
        await createNotification({
          receiverId: agencyId,
          senderId: userId,
          title: "ऑर्डर रिजेक्ट हो गया",
          message: `${manufacturerName} ने ${agentName} का ${orderAmountText} रिजेक्ट किया है।${reasonText}`,
          orderId,
        });
      }
    }
    req.result = { order };
  };
  const addToCart = async (req) => {
    const { PID, quantity } = req.body;
    const loginInUserId = req.user.id;

    if (!PID || !quantity || quantity <= 0) {
      throw new ApiError(400, "अमान्य प्रोडक्ट या मात्रा");
    }
    const product = await Product.findOne({ where: { PID, status: "Active" } });
    if (!product) throw new ApiError(400, "प्रोडक्ट नहीं मिला");
    const existing = await UserCart.findOne({
      where: { PID, userId: loginInUserId },
    });
    if (existing) {
      // Existing quantity update
      await existing.update({ quantity: existing.quantity + quantity });
      req.result = { cartList: existing };
      return; // Important: Stop here, don't create new cart
    }
    const cart = await UserCart.create({
      PID,
      userId: loginInUserId,
      quantity,
      MRP: product.MRP,
      price: product.price,
    });
    req.result = { cartList: cart };
  };
  const getCartList = async (req) => {
    const { page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;
    const { count, rows: cart } = await UserCart.findAndCountAll({
      where: { userId: req.user.id },
      attributes: ["id", "PID", "userId", "quantity", "MRP", "price"],
      include: [
        {
          model: Product,
          attributes: ["PName", "MRP", "price", "quantity", "unit", "image"],
        },
      ],
      limit: Limit,
      offset,
    });
    const totalCartItems = await UserCart.count({
      where: { userId: req.user.id },
    });
    req.result = {
      totalData: count,
      currentPage: Page || 0,
      totalPage: Math.ceil(count / Limit),
      totalCartItems,
      cartList: cart,
    };
  };
  const deleteCartItem = async (req) => {
    const { PID } = req.query;
    const loginInUserId = req.user.id;
    if (!PID) {
      throw new ApiError(400, "पीआईडी अनिवार्य है");
    }
    const existing = await UserCart.findOne({
      where: { PID, userId: loginInUserId },
    });
    if (!existing) {
      throw new ApiError(404, "कार्ट में आइटम नहीं मिला");
    }
    await existing.destroy();
  };
  const updateCartQuantity = async (req) => {
    const { PID, action, quantity } = req.body;
    const loginInUserId = req.user.id;
    if (!PID) {
      throw new ApiError(400, "पीआईडी अनिवार्य है");
    }
    const cartItem = await UserCart.findOne({
      where: { PID, userId: loginInUserId },
    });
    if (action === "+") {
      await cartItem.update({ quantity: cartItem.quantity + 1 });
    }
    if (action === "-") {
      // If quantity becomes 0 then delete the item
      if (cartItem.quantity - 1 <= 0) {
        await cartItem.destroy();
        req.result = { message: "कार्ट से आइटम हटा दिया गया" };
        return;
      }
      await cartItem.update({ quantity: cartItem.quantity - 1 });
    }
    if (quantity) {
      const newQty = Number(quantity);
      await cartItem.update({ quantity: newQty });
    }
    req.result = { cartItem };
  };
  const commissionCreate = async (req) => {
    const { orderId, agencyId, commissionAmt } = req.body;
    if (!agencyId || !commissionAmt) {
      throw new ApiError(400, "एजेंसी आईडी और कमीशन राशि अनिवार्य हैं");
    }
    const agency = await Users.findOne({
      where: { id: agencyId, userType: "Agency" },
    });
    if (!agency) {
      throw new ApiError(400, "एजेंसी नहीं मिली");
    }
    let entry = await Commission.findOne({ where: { agencyId } });
    if (entry) {
      entry.commissionAmt = Number(entry.commissionAmt) + Number(commissionAmt);
      entry.commissionDate = new Date();
      await entry.save();
    } else {
      entry = await Commission.create({
        orderId: orderId || null,
        agencyId,
        commissionAmt,
        status: "pending",
        commissionDate: new Date(),
      });
    }
    agency.wallet = Number(agency.wallet) + Number(commissionAmt);
    await agency.save();
    req.result = { entry };
  };
  const commissionPay = async (req) => {
    const { agencyId, amount, paymentMode, transactionId } = req.body;
    if (!amount || !agencyId) {
      throw new ApiError(400, "एजेंसी आईडी और राशि अनिवार्य हैं");
    }
    const agency = await Users.findOne({
      where: { id: agencyId, userType: "Agency" },
    });
    if (!agency) throw new ApiError(400, "एजेंसी नहीं मिली");
    if (Number(agency.wallet) < Number(amount)) {
      throw new ApiError(400, "वॉलेट बैलेंस पर्याप्त नहीं है");
    }
    const commission = await Commission.findOne({ where: { agencyId } });
    const txn = await TxnCommission.create({
      commissionId: commission.id,
      agencyId: agency.id,
      amount,
      paymentMode,
      transactionId,
      paymentDate: new Date(),
    });
    agency.wallet = Number(agency.wallet) - Number(amount);
    await agency.save();

    const remaining = Number(agency.wallet);

    if (remaining <= 0) {
      commission.status = "paid";
    } else {
      commission.status = "partial_paid";
    }
    await commission.save();
    req.result = {
      transaction: txn,
      walletBalance: agency.wallet,
    };
  };
  const getCommissions = async (req) => {
    const { agencyId } = req.query;

    if (!agencyId) {
      throw new ApiError(400, "एजेंसी आईडी अनिवार्य है");
    }

    const commissions = await Commission.findAll({
      where: { agencyId },
      order: [["commissionDate", "DESC"]],
    });
    const agency = await Users.findOne({ where: { id: agencyId } });
    req.result = { commissions, agencyWallet: agency.wallet };
  };
  const getCommissionsTransaction = async (req) => {
    const { agencyId, page, limit } = req.query;
    if (!agencyId) throw new ApiError(400, "एजेंसी आईडी अनिवार्य है");
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;
    const { count, rows: transactions } = await TxnCommission.findAndCountAll({
      where: { agencyId: Number(agencyId) },
      order: [["createdAt", "DESC"]],
      attributes: [
        "agencyId",
        "amount",
        "paymentMode",
        "transactionId",
        "paymentDate",
      ],
      include: [
        {
          model: Commission,
          as: "commission",
          attributes: ["commissionAmt"],
        },
      ],
      limit: Limit,
      offset,
    });

    req.result = {
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      transactions,
    };
  };
  const pendingPayment = async (req) => {
    const { orderId, amount } = req.body;
    if (amount === undefined || Number(amount) <= 0) {
      throw new ApiError(400, "मान्य राशि भेजना ज़रूरी है");
    }
    const order = await Order.findOne({ where: { orderId } });
    if (!order) throw new ApiError(400, "ऑर्डर नहीं मिला");
    const oldPaid = Number(order.balance) || 0;
    const newPaid = oldPaid + Number(amount);
    if (newPaid > Number(order.totalAmt)) {
      throw new ApiError(400, "पेमेंट राशि कुल राशि से ज्यादा नहीं हो सकती");
    }
    order.balance = newPaid;
    if (newPaid == 0) {
      order.paymentStatus = "unpaid";
    } else if (newPaid < order.totalAmt) {
      order.paymentStatus = "partial_paid";
    } else if (newPaid == order.totalAmt) {
      order.paymentStatus = "paid";
    } else {
      order.paymentStatus = "unpaid";
    }
    await order.save();
    await OrderPayment.create({
      orderId: order.orderId,
      paidAmount: amount,
      paidBy: req.user.id,
    });
    req.result = { order };
  };
  const getPendingPayment = async (req) => {
    const { orderId } = req.query;
    const order = await Order.findOne({ where: { orderId } });
    const pendingAmount = Number(order.totalAmt) - Number(order.balance);
    req.result = { pendingAmount, totalAmt: order.totalAmt };
  };
  const getAgencyOrderSummary = async (req) => {
    const { agencyId } = req.query;
    const commission = await Commission.findOne({ where: { agencyId } });
    const agencyWallet = await Users.findOne({ where: { id: agencyId } });
    const agents = await Users.findAll({
      where: { generatedBy: agencyId, userType: "Agent" },
    });
    const agentIds = agents.map((a) => a.id);
    const totalOrderSum = await Order.sum("totalAmt", {
      where: { orderFrom: agentIds },
    });
    req.result = {
      totalcommission: commission.commissionAmt,
      agencyWallet: agencyWallet.wallet,
      totalOrderSum: totalOrderSum,
    };
  };
  const getAgencyAgentSalesSummary = async (req) => {
    const { agencyId } = req.query;
    if (!agencyId) {
      throw new ApiError(400, "एजेंसी आईडी अनिवार्य है");
    }
    const agents = await Users.findAll({
      where: { generatedBy: agencyId, userType: "Agent" },
    });
    const agentIds = agents.map((a) => a.id);
    const totalOrders = await Order.count({
      where: { orderFrom: { [Op.in]: agentIds } },
    });
    const totalSales =
      (await Order.sum("totalAmt", {
        where: {
          orderFrom: { [Op.in]: agentIds },
        },
      })) || 0;
    const totalReceived =
      (await Order.sum("balance", {
        where: {
          orderFrom: { [Op.in]: agentIds },
        },
      })) || 0;
    const totalRemaining = Number(totalSales) - Number(totalReceived);
    req.result = { totalOrders, totalSales, totalReceived, totalRemaining };
  };
  const getAgentAllOrderList = async (req) => {
    const { agentId, page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;
    const { count, rows: orderList } = await Order.findAndCountAll({
      where: { orderFrom: Number(agentId) },
      attributes: [
        "orderId",
        "orderDate",
        "totalAmt",
        "orderStatus",
        "balance",
      ],
      limit: Limit,
      offset,
      order: [["orderDate", "DESC"]],
    });
    req.result = {
      totalData: count || 0,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      orderList,
    };
  };
  const getAgentOrderDetails = async (req) => {
    const { agentId, orderId } = req.query;
    const orderDetails = await Order.findOne({
      where: { orderFrom: Number(agentId), orderId: Number(orderId) },
      order: [["orderDate", "DESC"]],
    });
    const payments = await OrderPayment.findAll({
      where: { orderId: orderId },
      order: [["paymentDate", "ASC"]],
      attributes: ["id", "paidAmount", "paymentDate"],
    });

    req.result = { orderDetails, payments };
  };
  const getAgentOrderSummaryCount = async (req) => {
    const { agentId } = req.query;
    if (!agentId) {
      throw new ApiError(400, "एजेंट आईडी अनिवार्य है");
    }
    const totalOrders = await Order.count({
      where: { orderFrom: Number(agentId) },
    });

    const totalSales =
      (await Order.sum("totalAmt", {
        where: { orderFrom: Number(agentId) },
      })) || 0;

    const totalReceived =
      (await Order.sum("balance", {
        where: { orderFrom: Number(agentId) },
      })) || 0;

    const totalRemaining = Number(totalSales) - Number(totalReceived);
    req.result = { totalOrders, totalSales, totalReceived, totalRemaining };
  };

  return {
    orderCreate,
    addToCart,
    deleteCartItem,
    getCartList,
    updateCartQuantity,
    getOrderHistory,
    getOrderDetails,
    updateOrderStatus,
    commissionCreate,
    commissionPay,
    getCommissions,
    getCommissionsTransaction,
    pendingPayment,
    getPendingPayment,
    getAgencyOrderSummary,
    getAgencyAgentSalesSummary,
    getAgentAllOrderList,
    getAgentOrderDetails,
    getAgentOrderSummaryCount,
  };
};

module.exports = OrderService();
