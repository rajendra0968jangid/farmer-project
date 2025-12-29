// services/setting.service.js

const { where, Model, Op } = require("sequelize");
const db = require("../models/db.model");
const ApiError = require("../utils/apiError");

const Users = db.users;
const Orders = db.orders;
const Version = db.version;

const SettingService = () => {
  const updateUserStatus = async (req) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        throw new ApiError(400, "उपयोगकर्ता आईडी देना अनिवार्य है");
      }

      const id = parseInt(userId, 10);
      if (isNaN(id)) {
        throw new ApiError(400, "गलत उपयोगकर्ता आईडी");
      }

      const { status } = req.body;
      if (!["Active", "Inactive"].includes(status)) {
        throw new ApiError(
          400,
          "स्टेटस केवल ‘Active’ या ‘Inactive’ ही होना चाहिए"
        );
      }
      const loggedInUser = req.user;
      // Apna status check
      if (loggedInUser.status !== "Active") {
        throw new ApiError(403, "आपका अकाउंट एक्टिव नहीं है");
      }

      // Target user find karo
      const targetUser = await Users.findByPk(id);
      if (!targetUser) {
        throw new ApiError(404, "उपयोगकर्ता नहीं मिला");
      }

      // Manufacturer ka status koi change na kare
      if (targetUser.userType === "Manufacturer") {
        throw new ApiError(403, "मैन्युफैक्चरर का स्टेटस बदलना संभव नहीं है");
      }

      // Permission Check
      if (loggedInUser.userType === "Manufacturer") {
        // Admin ko sab allowed
      } else if (loggedInUser.userType === "Agency") {
        if (
          targetUser.userType !== "Agent" ||
          targetUser.generatedBy !== loggedInUser.id
        ) {
          throw new ApiError(
            403,
            "आप केवल अपने स्वयं के एजेंट्स का स्टेटस बदल सकते हैं"
          );
        }
      } else {
        throw new ApiError(
          403,
          "आपको उपयोगकर्ता का स्टेटस बदलने की अनुमति नहीं है"
        );
      }

      // Status update
      targetUser.status = status;
      await targetUser.save();

      // req.result set kar do (tumhare style mein)
      req.result = {
        id: targetUser.id,
        name: targetUser.name,
        userName: targetUser.userName,
        mobileNo: targetUser.mobileNo,
        userType: targetUser.userType,
        status: targetUser.status,
        message: "उपयोगकर्ता का स्टेटस सफलतापूर्वक अपडेट कर दिया गया है",
      };
    } catch (error) {
      throw error; // asyncHandler catch karega
    }
  };
  const softDeleteUser = async (req) => {
    const { userId } = req.query;

    if (!userId) throw new ApiError(400, "उपयोगकर्ता आईडी देना अनिवार्य है");

    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      throw new ApiError(400, "गलत उपयोगकर्ता आईडी");
    }

    const loggedInUser = req.user;

    if (loggedInUser.userType !== "Manufacturer") {
      throw new ApiError(
        400,
        "केवल मैन्युफैक्चरर ही उपयोगकर्ताओं को हटा सकता है"
      );
    }

    const targetUser = await Users.findByPk(id);
    if (!targetUser) throw new ApiError(404, "उपयोगकर्ता नहीं मिला");

    if (targetUser.deletedAt !== null) {
      throw new ApiError(400, "उपयोगकर्ता पहले से ही हटाया जा चुका है");
    }

    // ===============================
    // ❌ Agent delete check
    // ===============================
    if (targetUser.userType === "Agent") {
      const nonDeliveredOrders = await Orders.findAll({
        where: {
          orderFrom: targetUser.id,
          orderStatus: { [Op.notIn]: ["delivered", "cancelled", "rejected"] },
        },
        attributes: ["orderId"],
      });

      if (nonDeliveredOrders.length > 0) {
        const orderIds = nonDeliveredOrders.map((o) => o.orderId).join(", ");
        throw new ApiError(
          400,
          `इस एजेंट के ऑर्डर (${orderIds}) अभी पूरे नहीं हुए हैं। सभी ऑर्डर पूरे होने के बाद ही डिलीट कर सकते हैं।`
        );
      }
    }

    let deletedAgentCount = 0;

    // ===============================
    // ❌ Agency delete check
    // ===============================
    if (targetUser.userType === "Agency") {
      const nonDeliveredOrderByAnyAgent = await Orders.findAll({
        where: {
          orderStatus: { [Op.notIn]: ["delivered", "cancelled", "rejected"] },
        },
        include: [
          {
            model: Users,
            where: { generatedBy: id }, // agency ke agents
            attributes: [],
          },
        ],
        attributes: ["orderId"],
      });

      if (nonDeliveredOrderByAnyAgent.length > 0) {
        const orderIds = nonDeliveredOrderByAnyAgent
          .map((o) => o.orderId)
          .join(", ");

        throw new ApiError(
          400,
          `इस एजेंसी के एजेंटों के ऑर्डर (${orderIds}) अभी पूरे नहीं हुए हैं। सभी ऑर्डर पूरे होने के बाद ही एजेंसी डिलीट कर सकते हैं।`
        );
      }

      // 🔹 Soft delete all agents of agency
      const [affectedRows] = await Users.update(
        {
          deletedAt: new Date(),
          status: "Inactive",
        },
        {
          where: {
            generatedBy: id,
            userType: "Agent",
            deletedAt: null,
          },
        }
      );

      deletedAgentCount = affectedRows;
    }

    // ===============================
    // ✅ Soft delete target user
    // ===============================
    await targetUser.update({
      deletedAt: new Date(),
      status: "Inactive",
    });

    req.result = {
      deletedUser: {
        id: targetUser.id,
        name: targetUser.name,
        userName: targetUser.userName,
        mobileNo: targetUser.mobileNo,
        userType: targetUser.userType,
        status: targetUser.status,
      },
      ...(deletedAgentCount > 0 && {
        agentsDeleted: {
          count: deletedAgentCount,
          message: "संबद्ध एजेंटों को भी हटा दिया गया",
        },
      }),
    };
  };
  const logout = async (req) => {
    const userId = req.user.id;
    const token = req.token; // 🔥 JWT token yahin se milega

    if (!userId || !token) {
      throw new ApiError(400, "टोकन या यूज़रआईडी नहीं मिला");
    }

    // STEP 1: current session का fcmToken निकालो
    const session = await db.loginlogs.findOne({
      where: {
        userId,
        token, // 🔥 exact token match
        isExpired: false,
      },
      attributes: ["fcmToken"],
    });

    const currentFcmToken = session?.fcmToken?.trim();

    // STEP 2: loginlogs में इस token को expire कर दो
    await db.loginlogs.update(
      { isExpired: true },
      { where: { userId, token } }
    );

    // STEP 3: userfcmtoken में केवल इसी device का token inactive करो
    if (currentFcmToken) {
  await db.userfcmtoken.update(
    { isActive: false },
    {
      where: {
        userId,
        fcmToken: currentFcmToken,
        isActive: true, // सिर्फ active वाले token को hi update करो
      },
    }
  );
}

    req.result = {
      userId,
      message: "सफलतापूर्वक लॉगआउट हुआ",
    };
  };
  const getLatestVersion = async (req, res) => {
    try {
      const versions = await Version.findOne({
        attributes: ["version", "url", "required"],
        where: { status: "Active" },
        order: [["id", "DESC"]],
      });
      if (!versions) {
        throw new ApiError(400, "कोई वर्शन नहीं मिला");
      }
      req.result = versions;
    } catch (error) {
      throw error;
    }
  };
  return { updateUserStatus, softDeleteUser, logout, getLatestVersion };
};

module.exports = SettingService(); // bilkul UserService ki tarah
