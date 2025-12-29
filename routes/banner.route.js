const express = require('express')
const { verifyToken } = require('../middlerwares/verifyToken')
const { getbannerForAgent, addBannerByUrl, deleteBanner } = require('../controllers/banner.controller')

const router = express.Router()

router.get("/getbannerforagent", getbannerForAgent)
router.post("/addbannerbyurl", verifyToken, addBannerByUrl)
router.delete("/deletebanner/:id", verifyToken, deleteBanner)


module.exports = router;