const ManufacturerService = require("../services/manufacturer.service")
const {Apiresponse} = require("../utils/apiResponse");
const {asyncHandler} = require("../utils/asyncHandler")

exports.getAllAgency = asyncHandler(async(req ,res)=>{
  await ManufacturerService.getAllAgency(req , res);
  return res.status(200).json(new Apiresponse(200 , req.result ,`सभी एजेंसियाँ सफलतापूर्वक मिल गईं` ))
})
exports.getAgencyAgent = asyncHandler(async(req ,res)=>{
  await ManufacturerService.getAgencyAgent(req ,res);
  return res.status(200).json(new Apiresponse(200 ,req.result ,`एजेंट की सूची सफलतापूर्वक प्राप्त हुई` ))
})
exports.getAllAgent = asyncHandler(async(req , res)=>{
  await ManufacturerService.getAllAgent(req ,res);
  return res.status(200).json(new Apiresponse(200 , req.result,"सभी एजेंट प्राप्त हो गए"))
});
exports.userDetails = asyncHandler(async(req ,res)=>{
  await ManufacturerService.userDetails(req ,res);
  return res.status(200).json(new Apiresponse(200 ,  req.result , "यूज़र की जानकारी सफलतापूर्वक प्राप्त हुई" ))
})

exports.addCategory = asyncHandler(async(req ,res)=>{
    await ManufacturerService.addCategory(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "कैटेगरी बना दी गई"))
});
exports.getcategoryList = asyncHandler(async(req ,res)=>{
    await ManufacturerService.getcategoryList(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "कैटेगरी की सूची सफलतापूर्वक मिल गई "))
});
exports.uploadImage = asyncHandler(async(req ,res)=>{
    await ManufacturerService.uploadImage(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "इमेज सफलतापूर्वक अपलोड हुई"))
});
exports.addProduct = asyncHandler(async(req ,res)=>{
    await ManufacturerService.addProduct(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट सफलतापूर्वक जोड़ा गया"))
});
exports.getProductList = asyncHandler(async(req ,res)=>{
    await ManufacturerService.getProductList(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट की सूची सफलतापूर्वक मिल गई"))
});
exports.getProductDetails = asyncHandler(async(req ,res)=>{
    await ManufacturerService.getProductDetails(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट की जानकारी सफलतापूर्वक मिल गई"))
});
exports.updateProduct = asyncHandler(async(req ,res)=>{
    await ManufacturerService.updateProduct(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट सफलतापूर्वक अपडेट हो गया"))
});
exports.deleteProduct = asyncHandler(async(req ,res)=>{
    await ManufacturerService.deleteProduct(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट सफलतापूर्वक डिलीट हो गया"))
});
exports.getOrderMetaData = asyncHandler(async(req ,res)=>{
    await ManufacturerService.getOrderMetaData(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "बैंक की जानकारी सफलतापूर्वक मिल गई"))
});
exports.updateCategoryStatus = asyncHandler(async(req ,res)=>{
    await ManufacturerService.updateCategoryStatus(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "कैटेगरी का स्टेटस सफलतापूर्वक अपडेट हो गया"))
});
exports.updateProductStatus = asyncHandler(async(req ,res)=>{
    await ManufacturerService.updateProductStatus(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "प्रोडक्ट का स्टेटस सफलतापूर्वक अपडेट हो गया"))
});
exports.updateCategory = asyncHandler(async(req ,res)=>{
    await ManufacturerService.updateCategory(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "कैटेगरी की जानकारी सफलतापूर्वक अपडेट हो गई"))
});
exports.deleteCategory = asyncHandler(async(req ,res)=>{
    await ManufacturerService.deleteCategory(req);
    return res.status(200).json(new Apiresponse(200 , req.result , "कैटेगरी सफलतापूर्वक डिलीट हो गई"))
});
exports.globleSearch = asyncHandler(async(req,res)=>{
    await ManufacturerService.globleSearch(req);
    return res.status(200).json(new Apiresponse(200, req.result, "सर्च का रिज़ल्ट सफलतापूर्वक मिल गया"))
});
exports.summaryCount = asyncHandler(async(req,res)=>{
    await ManufacturerService.summaryCount(req);
    return res.status(200).json(new Apiresponse(200, req.result, "समरी की जानकारी सफलतापूर्वक मिल गई"))
});

