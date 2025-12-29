const UserService = require("../services/user.service")
const { Apiresponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler")


exports.createUser = asyncHandler(async (req, res) => {
    await UserService.createUser(req);
    return res.status(200).json(new Apiresponse(200, req.result, "यूज़र सफलतापूर्वक बनाई गई"))
});
exports.login = asyncHandler(async (req, res) => {
    await UserService.login(req);
    return res.status(200).json(new Apiresponse(200, req.result, "यूज़र सफलतापूर्वक लॉगिन हुआ"))
});

exports.changePassword = asyncHandler(async (req, res) => {
    await UserService.changePassword(req);
    return res.status(200).json(new Apiresponse(200, req.result, "पासवर्ड सफलतापूर्वक बदल दिया गया"))
})

exports.creteProfile = asyncHandler(async (req, res) => {
    await UserService.createProfile(req);
    return res.status(200).json(new Apiresponse(200, req.result, "प्रोफ़ाइल सफलतापूर्वक बना दी गई"))
})

exports.getProfile = asyncHandler(async(req,res)=>{
    await UserService.getProfile(req);
    return res.status(200).json(new Apiresponse(200, req.result, "प्रोफ़ाइल की जानकारी सफलतापूर्वक मिल गई"))
})
exports.getAllState = asyncHandler(async (req, res) => {
    await UserService.getAllStates(req);
    return res.status(200).json(new Apiresponse(200, req.result, "राज्य की सूची सफलतापूर्वक मिल गई"))
})
exports.getCitiesByState = asyncHandler(async (req, res) => {
    await UserService.getCitiesByState(req);
    return res.status(200).json(new Apiresponse(200, req.result, "शहरों की सूची सफलतापूर्वक मिल गई"))
})
exports.profileupdate = asyncHandler(async (req, res) => {
    await UserService.profileUpdate(req);
    return res.status(200).json(new Apiresponse(200, req.result, "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई"))
})
