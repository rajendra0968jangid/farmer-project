const SettingService = require("../services/setting.service")
const { Apiresponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");


exports.updateUserStatus = asyncHandler(async(req,res)=>{
    await SettingService.updateUserStatus(req);
    return res.status(200).json(new Apiresponse(200, req.result , "स्टेटस सफलतापूर्वक अपडेट हो गया"))
})

exports.softDeleteUser = asyncHandler(async(req,res)=>{
    await SettingService.softDeleteUser(req);
    return res.status(200).json(new Apiresponse(200, req.result, "उपयोगकर्ता को सॉफ़्ट डिलीट सफलतापूर्वक किया गया"))
})

exports.logout = asyncHandler(async(req,res)=>{
    await SettingService.logout(req);
    return res.status(200).json(new Apiresponse(200, req.result, "लॉगआउट सफलतापूर्वक हो गया"))
});

exports.getLatestVersion = asyncHandler(async (req, res) => {
  await SettingService.getLatestVersion(req);
  return res.status(200).json(new Apiresponse(200, req.result, "लेटेस्ट वर्शन सफलतापूर्वक प्राप्त किया गया"));
});