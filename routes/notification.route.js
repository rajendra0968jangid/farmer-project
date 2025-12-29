const express = require("express");
const { verifyToken } = require("../middlerwares/verifyToken");
const {
  getMyUnreadNotification,
  readNotification,
  deleteNotification,
  markOrderDeliveredByAgency,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/getmyunreadNotification", verifyToken, getMyUnreadNotification);
router.get("/readNotification", verifyToken, readNotification);
router.delete("/deletenotification", verifyToken, deleteNotification);
router.post(
  "/markorderdeliveredbyagent",
  verifyToken,
  markOrderDeliveredByAgency
);

module.exports = router;
