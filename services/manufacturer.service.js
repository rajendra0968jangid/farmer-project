const { where, Op } = require("sequelize");
const ApiError = require("../utils/apiError");
const db = require("../models/db.model");
const indiaData = require("../data/india-state-citys.json");
const stateToRegion = require("../config/stateToRegion")

const Users = db.users;
const Bankdetails = db.bankdetails;
const Address = db.address;
const Categories = db.categories;
const Product = db.products;
const UserCart = db.usercarts;
const OrderItems = db.orderitems;
const Order = db.orders;

const ManufacturerService = () => {
  const getAllAgency = async (req) => {
    let { search, page, limit } = req.query;
    try {
      const Page = Number(page) || 1;
      const Limit = Number(limit) || 10;
      const offset = (Page - 1) * Limit;
      let whereCondition = { userType: "Agency", deletedAt: null };
      if (search) {
        if (search.length < 3) {
          throw new ApiError(
            400,
            "सर्च करने के लिए कम से कम पहले 3 अक्षर या नंबर दर्ज करें"
          );
        }
        whereCondition[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { mobileNo: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: agency } = await Users.findAndCountAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]],
        limit: Limit,
        offset,
        attributes: {
          include: [
            [
              // total agent count
              db.Sequelize.literal(
                `(SELECT COUNT(*) FROM users AS agent WHERE agent.generatedBy = users.id
                AND agent.userType = 'Agent'
                AND agent.deletedAt IS NULL
                )`
              ),
              "totalagent",
            ],
          ],
          exclude: [
            "generatedBy",
            "deletedAt",
            "updatedAt",
            "createdAt",
            "isPassword",
          ],
        },
      });
      req.result = {
        totalData: count,
        currentPage: Page,
        totalPage: Math.ceil(count / Limit),
        agency
      };
    } catch (error) {
      throw error;
    }
  };
  const getAgencyAgent = async (req) => {
    let { id, search, page, limit } = req.query;
    if (!id) {
      throw new ApiError(400, "एजेंसी आईडी ज़रूरी है");
    }
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    offset = (Page - 1) * Limit;
    const baseWhere = { generatedBy: id, deletedAt: null };
    let whereCondition = { ...baseWhere };
    if (search) {
      if (search.length < 3) {
        throw new ApiError(400, "सर्च कम से कम 3 अक्षरों का होना चाहिए");
      }
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { userName: { [Op.like]: `%${search}%` } },
            { mobileNo: { [Op.like]: `%${search}%` } },
          ],
        },
      ];
    }
    const { count, rows: agent } = await Users.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: Limit,
      offset,
      attributes: [
        "id",
        "name",
        "userName",
        "password",
        "mobileNo",
        "generatedBy",
        "status",
        "userType",
      ],
    });

    const allDataCount = await Users.count({ where: baseWhere })
    req.result = {
      allDataCount,
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      agent
    };
  };
  const getAllAgent = async (req) => {
    const { search, page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;
    const whereCondition = { userType: "Agent", deletedAt: null };
    if (search) {
      if (search.length < 3) {
        throw new ApiError(
          400,
          "कम से कम 3 अक्षर या नंबर डालकर सर्च करें"
        );
      }
    }
    whereCondition[Op.or] = [
      { userName: { [Op.like]: `%${search}%` } },
      { mobileNo: { [Op.like]: `%${search}%` } },
    ];
    const { count, rows: agent } = await Users.findAndCountAll({
      where: whereCondition,
      include: [{ model: Users, attributes: ["id", "userName", "name"] }],
      order: [["createdAt", "DESC"]],
      limit: Limit,
      offset
    });
    req.result = {
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      agent
    };
  };
  const userDetails = async (req) => {
    const { id } = req.query;
    const user = await Users.findAll({
      where: { id, deletedAt: null },
      include: [
        { model: Bankdetails, as: "bankdetails" },
        { model: Address, as: "address" },
      ],
    });
    if (!user) throw new ApiError(400, "यूज़र नहीं मिला");
    let singleAddress = user[0];
    if (singleAddress.address) {
      const stateId = singleAddress.address.state;
      const stateObj = indiaData.states.find(
        (s) => String(s.id) === String(stateId)
      );
      const stateName = stateObj ? stateObj.name : "Unknown State";
      singleAddress.address.state = stateName;
    }
    const pendingOrder = await Order.count({
      where: { orderStatus: "pending", orderFrom: id },
    });
    const totalOrder = await Order.count({ where: { orderFrom: id } });
    const completedOrders = await Order.count({
      where: { orderStatus: "delivered", orderFrom: id },
    });
    const totalRevenue = await Order.sum("totalAmt", { where: { orderFrom: id } });
    const totalAmountPay = await Order.sum("balance", { where: { orderFrom: id } });
    req.result = {
      user,
      Bankdetails: singleAddress.bankdetails,
      pendingOrder,
      totalOrder,
      completedOrders,
      totalRevenue,
      totalAmountPay,
    };
  };
  const addCategory = async (req) => {
    const { CName, CDesc, imageUrl } = req.body;
    if (!CName) {
      throw new ApiError(400, "कैटेगरी का नाम जरूरी है");
    }
    const exist = await Categories.findOne({
      where: { CName, deletedAt: null },
    });
    if (exist) {
      throw new ApiError(400, "यह कैटेगरी पहले से मौजूद है");
    }
    const category = await Categories.create({
      CName,
      CDesc,
      image: imageUrl,
      status: "Active",
    });
    req.result = { category };
  };
  const uploadImage = async (req) => {
    const files = req.files;
    const file = req.file;
    if ((!files || files.length === 0) && !file) {
      throw new ApiError(400, "कृपया इमेज अपलोड करें");
    }
    let imageUrl;

    if (files && files.length > 0) {
      imageUrl = files.map((f) => f.location); // Multiple files
    } else if (file) {
      imageUrl = file.location; // Single file
    }
    req.result = { imageUrl };
  };
  const addProduct = async (req) => {
    const {
      CID,
      PName,
      PDesc,
      MRP,
      unit,
      quantity,
      price,
      imageUrl,
      location,
      season,
    } = req.body;
    if (!CID) {
      throw new ApiError(400, "कैटेगरी ID आवश्यक है");
    }
    if (!PName) {
      throw new ApiError(400, "प्रोडक्ट का नाम आवश्यक है");
    }
    const exist = await Product.findOne({
      where: { PName, deletedAt: null },
    });
    if (exist) {
      throw new ApiError(400, "यह प्रोडक्ट पहले से मौजूद है");
    }
    const product = await Product.create({
      CID,
      PName,
      PDesc,
      MRP,
      quantity,
      unit,
      price,
      image: imageUrl,
      location,
      season,
      status: "Active",
    });
    req.result = { product };
  };
  const getcategoryList = async (req) => {
    const { name, page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit;
    let whereCondition = { deletedAt: null };
    if (req.user.userType === "Agent") {
      whereCondition.status = "Active";
    }
    if (name) {
      whereCondition.CName = { [Op.like]: `%${name}%` };
    }
    const { count, rows: category } = await Categories.findAndCountAll({ where: whereCondition, limit: Limit, offset });
    req.result = {
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      categoryList: category
    };
  };
  const getProductList = async (req) => {
    const { cid, name, page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 10;
    const offset = (Page - 1) * Limit
    let whereCondition = {};
    const isAgent = req.user && req.user.userType === "Agent";
    // Category & Name filter
    if (cid) {
      whereCondition.CID = cid;
    }
    if (name) {
      whereCondition.PName = { [Op.like]: `%${name}%` };
    }
    // Active products for Agent
     if (isAgent) {
    whereCondition.status = "Active";
  }
    // 🔹 Agent ka address nikalo
    let address = null;
  if (isAgent) {
    address = await Address.findOne({
      where: { userId: req.user.id },
    });
  }

  // 🔹 Region filter sirf Agent ke liye
  if (isAgent && address?.state) {
    const stateObj = indiaData.states.find(
      (s) => String(s.id) === String(address.state)
    );

    if (stateObj) {
      const region = stateToRegion[stateObj.name];
      if (region) {
        whereCondition.location = {
          [Op.in]: [region, "संपूर्ण भारत"],
        };
      }
    }
  }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Categories,
          as: "category",
          attributes: ["CID", "CName", "status"],
           where: isAgent ? { status: "Active" } : {},
        },
      ],
      order: [["PID", "DESC"]],
      limit: Limit,
      offset,
    });

    req.result = {
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      productList: products
    };
  };
  const getProductDetails = async (req) => {
    const { pid } = req.query;
    const product = await Product.findOne({
      where: { PID: pid, deletedAt: null },
    });
    const cartItem = await UserCart.findOne({
      where: { PID: pid },
    });
    const quantity = cartItem ? cartItem.quantity : 1;
    req.result = { product, addToCartquantity: quantity };
  };
  const updateProduct = async (req) => {
    const { pid } = req.query;
    const {
      CID,
      PName,
      PDesc,
      MRP,
      unit,
      quantity,
      price,
      imageUrl,
      location,
      season,
    } = req.body;

    await Product.update(
      {
        CID,
        PName,
        PDesc,
        MRP,
        quantity,
        unit,
        price,
        image: imageUrl,
        location,
        season,
        status: "Active",
      },
      { where: { PID: pid } }
    );
    const updatedProduct = await Product.findOne({ where: { PID: pid } });
    req.result = { updatedProduct };
  };
  const deleteProduct = async (req) => {
    const { pid } = req.query;
    const product = await Product.findOne({
      where: { PID: pid },
    });
    if (!product) {
      throw new ApiError(400, "प्रोडक्ट नहीं मिला");
    }
    await product.destroy({ force: true });
    req.result = { produtDelete: product };
  };
  const getOrderMetaData = async (req) => {
    // Agent address fetch
    const address = await Address.findOne({
      where: { userId: req.user.id },
    });

    // Manufacturer UPI / QR fetch
    const manufacturer = await Users.findOne({
      where: { userType: "Manufacturer" },
      include: [
        {
          model: db.bankdetails,
          as: "bankdetails",
          attributes: ["upiId", "QR"],
        },
      ],
    });
    if (!manufacturer) {
      throw new CustomError(400, "मैन्युफैक्चरर नहीं मिला");
    }
    req.result = {
      agentAddress: address || null,
      manufacturerPayment: manufacturer.bankdetails || null,
    };
  };
  const updateCategoryStatus = async (req) => {
    const { cid, status } = req.body;
    const category = await Categories.findOne({ where: { CID: cid } });
    if (!category) throw new ApiError(400, "कैटेगरी नहीं मिली");
    category.status = status;
    await category.save();
    await Product.update({ status: status }, { where: { CID: cid } });
    req.result = { category };
  };
  const updateProductStatus = async (req) => {
    const { pid, status } = req.body;
    const product = await Product.findOne({ where: { PID: pid } });
    product.status = status;
    await product.save();
    req.result = { product };
  };
  const updateCategory = async (req) => {
    const { cid } = req.query;
    const { CName, CDesc, imageUrl } = req.body;

    await Categories.update(
      {
        CName,
        CDesc,
        image: imageUrl,
        status: "Active",
      },
      { where: { CID: cid } }
    );

    const updatedCategory = await Categories.findOne({ where: { CID: cid } });

    req.result = { updatedCategory };
  };
  const deleteCategory = async (req) => {
    const { cid } = req.query;
    const category = await Categories.findOne({
      where: { CID: cid },
    });
    if (!category) {
      throw new ApiError(400, "कैटेगरी नहीं मिला");
    }
    await category.destroy({ force: true });
    req.result = { categoryDelete: category };
  };
  const globleSearch = async (req) => {
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    if (user.userType !== "Manufacturer") throw new ApiError(400, "आपको अनुमति नहीं है");
    let whereCondition = { userType: ["Agency", "Agent"], deletedAt: null };
    let whereCategory = { deletedAt: null };
    let whereProduct = { deletedAt: null };
    let whereOrder = {};
    let { search } = req.query;

    whereCondition[Op.or] = [
      { userName: { [Op.like]: `%${search}%` } },
      { mobileNo: { [Op.like]: `%${search}%` } },
      { name: { [Op.like]: `%${search}%` } },
    ];
    whereCategory[Op.or] = [{ CName: { [Op.like]: `%${search}%` } }];

    whereProduct[Op.or] = [{ PName: { [Op.like]: `%${search}%` } }];

    const isNumber = !isNaN(search) && search !== "";
    if (isNumber) {
      whereOrder.orderId = parseInt(search);
    } else {
      whereOrder.orderId = { [Op.like]: `%${search}%` };
    }

    const result = await Users.findAll({
      where: whereCondition,
      attributes: ["id", "name", "userName", "userType", "mobileNo"],
      order: [["name", "ASC"]],
    });

    const resultCategory = await Categories.findAll({
      where: whereCategory,
      attributes: ["CID", "CName", "CDesc", "Image"],
      order: [["CName", "ASC"]],
    });

    // ✅ Step 1: Products fetch karo
    const resultProduct = await Product.findAll({
      where: whereProduct,
      attributes: [
        "PID",
        "CID",
        "PName",
        "PDesc",
        "MRP",
        "quantity",
        "unit",
        "price",
        "image",
        "location",
        "season",
      ],
      order: [["PName", "ASC"]],
    });

    // ✅ Step 2: Product ke agents nikalo
    let finalProducts = resultProduct;

    if (resultProduct.length > 0) {
      const productIds = resultProduct.map((p) => p.PID);

      // Agents jo in products ko purchase kiye hain
      const agentsByProduct = await OrderItems.findAll({
        where: { PID: productIds },
        attributes: ["PID"],
        include: [
          {
            model: Order,
            as: "order",
            attributes: ["orderFrom"], // Agent ID
            required: true,
          },
        ],
        raw: true,
      });

      // Product ke saath agent IDs add karo
      finalProducts = resultProduct.map((product) => {
        const agents = agentsByProduct
          .filter((item) => item.PID === product.PID)
          .map((item) => item["order.orderFrom"]);

        // Duplicate agent IDs remove karo
        const uniqueAgentIds = [...new Set(agents)];

        return {
          PID: product.PID,
          CID: product.CID,
          PName: product.PName,
          PDesc: product.PDesc,
          MRP: product.MRP,
          quantity: product.quantity,
          unit: product.unit,
          price: product.price,
          image: product.image,
          location: product.location,
          season: product.season,
          agentIds: uniqueAgentIds, // ✅ Agent IDs added
        };
      });
    }

    // ✅ Step 3: OrderItems ke saath agent ID bhi fetch karo
    const resultOrder = await OrderItems.findAll({
      where: whereOrder,
      attributes: ["orderId", "PID", "quantity", "price", "MRP"],
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["orderFrom"], // ✅ Agent ID
          required: true,
        },
      ],
      order: [["orderId", "ASC"]],
    });

    req.result = {
      result,
      resultCategory,
      resultProduct: finalProducts, // ✅ Products with agent IDs
      resultOrder, // ✅ Orders with agent IDs
    };
  };
  const summaryCount = async (req) => {
    const totalProducts = await Product.count();
    const pendingOrder = await Order.count({
      where: { orderStatus: "pending" },
    });
    const totalOrder = await Order.count();
    const compliteOrder = await Order.count({
      where: { orderStatus: "delivered" },
    });
    const totalRevenue = await Order.sum("totalAmt");
    const totalAmount = await Order.sum("balance");
    const totalAgent = await Users.count({
      where: { userType: "Agent", deletedAt: null },
    });
    const totalAgency = await Users.count({
      where: { userType: "Agency", deletedAt: null },
    });
    req.result = {
      totalProducts,
      pendingOrder,
      compliteOrder,
      totalRevenue,
      totalAmount,
      totalOrder,
      totalAgency,
      totalAgent,
    };
  };

  return {
    addCategory,
    getAllAgency,
    getAgencyAgent,
    getAllAgent,
    userDetails,
    uploadImage,
    addProduct,
    getcategoryList,
    getProductList,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getOrderMetaData,
    updateCategoryStatus,
    updateProductStatus,
    updateCategory,
    deleteCategory,
    globleSearch,
    summaryCount,
  };
};
module.exports = ManufacturerService();
