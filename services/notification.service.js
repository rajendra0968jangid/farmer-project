const { where } = require("sequelize");
const db = require("../models/db.model");
const ApiError = require("../utils/apiError");
const { createNotification } = require("../src/service/notification");
const sendMail = require("../utils/sendMail");
const Notification = db.notification;
const Order = db.orders;
const Users = db.users;

const NotificationService = () => {
  const getMyUnreadNotification = async (req) => {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const Page = Number(page) || 1;
    const Limit = Number(limit) || 20;
    const offset = (Page - 1) * Limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: {
        userId: userId, // receiver
      },
      attributes: [
        "id",
        "title",
        "message",
        "orderId",
        "pageName",
        "createdAt",
        "readReceipt",
        "isDelivered",
      ],
      order: [["createdAt", "DESC"]],
      limit: Limit,
      offset,
    });

    const unreadNotificationCount = await Notification.count({
      where: {
        userId: userId,
        readReceipt: false,
      },
    });

    req.result = {
      unreadNotificationCount,
      totalData: count,
      currentPage: Page,
      totalPage: Math.ceil(count / Limit),
      notifications,
    };
  };

  const readNotification = async (req) => {
    const userId = req.user.id;
    const notificationId = req.query.id;

    if (!notificationId) {
      throw new ApiError(400, "नोटिफिकेशन आईडी जरूरी है");
    }

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: userId,
        readReceipt: false,
      },
    });

    if (!notification) {
      req.result = {
        message: "नोटिफिकेशन नहीं मिला या पहले ही पढ़ा जा चुका है",
      };
      return;
    }

    if (notification.readReceipt === true) {
      req.result = { message: "नोटिफिकेशन पहले ही पढ़ा जा चुका है" };
      return;
    }

    notification.readReceipt = true;
    await notification.save();

    req.result = {
      message: "नोटिफिकेशन पढ़ लिया गया",
      notification,
    };
  };

  const deleteNotification = async (req) => {
    const userId = req.user.id;
    let { notificationIds } = req.body;

    // ❌ Validation
    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      throw new ApiError(400, "नोटिफिकेशन IDs की लिस्ट जरूरी है");
    }

    // 🔹 Ensure all are numbers
    notificationIds = notificationIds.map((id) => Number(id));

    // 🔹 Fetch notifications (ownership check)
    const notifications = await Notification.findAll({
      where: {
        id: notificationIds,
        userId: userId,
      },
    });

    if (!notifications.length) {
      throw new ApiError(404, "कोई नोटिफिकेशन नहीं मिला");
    }

    // 🔹 Delete all matched notifications
    await Notification.destroy({
      where: {
        id: notificationIds,
        userId: userId,
      },
    });

    req.result = {
      deletedCount: notifications.length,
    };
  };

  const markOrderDeliveredByAgency = async (req) => {
    const { orderId, notificationId } = req.body;
    const user = req.user;

    // ✅ ONLY AGENT CAN MARK
    if (user.userType !== "Agent") {
      throw new ApiError(403, "केवल एजेंट ही नोटिफिकेशन मार्क कर सकता है");
    }

    if (!orderId || !notificationId) {
      throw new ApiError(400, "orderId और notificationId जरूरी है");
    }

    const order = await Order.findOne({ where: { orderId } });
    if (!order) throw new ApiError(400, "ऑर्डर नहीं मिला");

    // ✅ Safety: ensure order belongs to this agent
    if (order.orderFrom !== user.id) {
      throw new ApiError(403, "आप इस ऑर्डर के एजेंट नहीं हैं");
    }

    // ================= UPDATE NOTIFICATION =================
    const [updatedCount] = await Notification.update(
      {
        isDelivered: true,
        readReceipt: true,
      },
      {
        where: {
          id: notificationId,
          orderId,
          userId: user.id,
          isDelivered: false, // 🔑 Agent himself
        },
      }
    );

    if (updatedCount === 0) {
      throw new ApiError(
        404,
        "नोटिफिकेशन नहीं मिला या पहले ही अपडेट हो चुका है"
      );
    }

    req.result = {
      message: "नोटिफिकेशन सफलतापूर्वक पढ़ा और डिलीवर मार्क कर दिया गया",
    };
  };

  return {
    getMyUnreadNotification,
    readNotification,
    deleteNotification,
    markOrderDeliveredByAgency,
  };
};

module.exports = NotificationService();
