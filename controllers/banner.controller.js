const bannerService = require("../services/banner.service");
const { Apiresponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

exports.getbannerForAgent = asyncHandler(async (req, res) => {
    await bannerService.getBannerForAgent(req);
    return res.status(200).json(new Apiresponse(200, req.result, "बैनर सफलतापूर्वक मिल गया"))
})

exports.addBannerByUrl = asyncHandler(async (req, res) => {
    await bannerService.addBannerByUrl(req);
    return res.status(200).json(new Apiresponse(200, req.result, "बैनर सफलतापूर्वक जोड़ा गया"))
})
exports.deleteBanner = asyncHandler(async (req, res) => {
    await bannerService.deleteBanner(req);
    return res.status(200).json(new Apiresponse(200, req.result, "बैनर सफलतापूर्वक डिलीट कर दिया गया"))
})