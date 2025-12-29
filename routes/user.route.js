const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlerwares/verifyToken");
const { createUser, login, changePassword, getProfile, creteProfile, getAllState, getCitiesByState, profileupdate } = require("../controllers/user.controller");
const { sendNotification } = require("../src/service/notificationService");


router.post("/createUser", verifyToken, createUser);
router.post("/login", login);
router.patch("/changePassword", verifyToken, changePassword)
router.get("/getprofile", verifyToken, getProfile)
router.post("/creteprofile", verifyToken, creteProfile)
router.get("/getallstate", verifyToken, getAllState)
router.get("/getCitiesByState", verifyToken, getCitiesByState)
router.patch("/profileupdate", verifyToken, profileupdate)
router.post("/testnotification", verifyToken, async (req, res) => {
   try {
    const userId = req.user.id;
    const userName = req.user.name || "User";

    // सीधे भेजो
    const success = await sendNotification(
      userId,
      "टेस्ट नोटिफिकेशन",
      `हेलो ${userName} भाई! तेरा सिस्टम 100% काम कर रहा है!`,
      { type: "test", time: new Date().toLocaleString() }
    );

    if (success) {
      return res.json({
        success: true,
        message: "नोटिफिकेशन सफलतापूर्वक भेज दिया गया!",
        tip: "अपने फोन पर चेक करो – आया होगा!"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "FCM Token नहीं मिला या इनवैलिड है",
        solution: "ऐप से दोबारा लॉगिन करो (fcmToken भेजना जरूरी है)"
      });
    }
  } catch (error) {
    console.error("Test Notification Error:", error.message);

    // अगर token expired/invalid है तो DB से हटा देते हैं
    if (error.code?.includes('messaging/') && 
        (error.message.includes('not-registered') || error.message.includes('invalid'))) {
      return res.status(400).json({
        success: false,
        message: "FCM Token expire या invalid हो गया है",
        action: "DB से पुराना token हटाया जा रहा है...",
        autoFixed: true
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      tip: "सर्वर लॉग चेक करो"
    });
  }
});
module.exports = router;
