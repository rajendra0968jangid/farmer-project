

const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middlerwares/verifyToken");
const { updateUserStatus, softDeleteUser, logout, getLatestVersion } = require("../controllers/setting.controller");

router.patch("/updateUserStatus", verifyToken, updateUserStatus)
router.delete("/softdeleteuser", verifyToken, softDeleteUser)
router.post("/logout", verifyToken,logout)
router.get("/getLatestVersion", getLatestVersion);

module.exports = router;