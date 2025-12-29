const OrderService = require("../services/order.service")
const { Apiresponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");


exports.orderCreate = asyncHandler(async(req,res)=>{
    await OrderService.orderCreate(req);
    return res.status(200).json(new Apiresponse(200, req.result , "ऑर्डर सफलतापूर्वक रखा गया। मैन्युफैक्चरर की पुष्टि का इंतजार है।"))
})
exports.getOrderHistory = asyncHandler(async(req,res)=>{
    await OrderService.getOrderHistory(req);
    return res.status(200).json(new Apiresponse(200, req.result , "ऑर्डर हिस्ट्री प्राप्त करें"))
})
exports.getOrderDetails = asyncHandler(async(req,res)=>{
    await OrderService.getOrderDetails(req);
    return res.status(200).json(new Apiresponse(200, req.result , "ऑर्डर का विवरण प्राप्त करें"))
})
exports.updateOrderStatus = asyncHandler(async(req,res)=>{
    await OrderService.updateOrderStatus(req);
    return res.status(200).json(new Apiresponse(200, req.result , "ऑर्डर स्टेटस सफलतापूर्वक अपडेट किया गया"))
})
exports.addToCart = asyncHandler(async(req,res)=>{
    await OrderService.addToCart(req);
    return res.status(200).json(new Apiresponse(200, req.result , "कार्ट में जोड़ा गया"))
})
exports.getCartList = asyncHandler(async(req,res)=>{
    await OrderService.getCartList(req);
    return res.status(200).json(new Apiresponse(200, req.result , "सभी कार्ट सूची"))
})
exports.deleteCartItem = asyncHandler(async(req,res)=>{
    await OrderService.deleteCartItem(req);
    return res.status(200).json(new Apiresponse(200, req.result , "कार्ट आइटम हटाएँ"))
})
exports.updateCartQuantity = asyncHandler(async(req,res)=>{
    await OrderService.updateCartQuantity(req);
    return res.status(200).json(new Apiresponse(200, req.result , "कार्ट में आइटम की मात्रा अपडेट करें"))
})
exports.commissionCreate = asyncHandler(async(req,res)=>{
    await OrderService.commissionCreate(req);
    return res.status(200).json(new Apiresponse(200, req.result , "कमीशन सफलतापूर्वक बनाया गया"))
})
exports.commissionPay = asyncHandler(async(req,res)=>{
    await OrderService.commissionPay(req);
    return res.status(200).json(new Apiresponse(200, req.result , "कमीशन भुगतान करें"))
})
exports.getCommissions = asyncHandler(async (req, res) => {
  await OrderService.getCommissions(req);
  return res.status(200).json(new Apiresponse(200, req.result, "कमीशन भुगतान करें"));
});

exports.getCommissionsTransaction = asyncHandler(async (req, res) => {
  await OrderService.getCommissionsTransaction(req);
  return res.status(200).json(new Apiresponse(200, req.result, "कमीशन भुगतान करें"));
});
exports.updatePayment = asyncHandler(async (req, res) => {
  await OrderService.updatePayment(req);
  return res.status(200).json(new Apiresponse(200, req.result, "भुगतान अपडेट करें"));
});
exports.pendingPayment = asyncHandler(async (req, res) => {
  await OrderService.pendingPayment(req);
  return res.status(200).json(new Apiresponse(200, req.result, "लंबित भुगतान भेजें"));
});
exports.getPendingPayment = asyncHandler(async (req, res) => {
  await OrderService.getPendingPayment(req);
  return res.status(200).json(new Apiresponse(200, req.result, "लंबित भुगतान प्राप्त करें"));
});
exports.getAgencyOrderSummary = asyncHandler(async (req, res) => {
  await OrderService.getAgencyOrderSummary(req);
  return res.status(200).json(new Apiresponse(200, req.result, "समारी की गिनती प्राप्त करें"));
});
exports.getAgencyAgentSalesSummary = asyncHandler(async (req, res) => {
  await OrderService.getAgencyAgentSalesSummary(req);
  return res.status(200).json(new Apiresponse(200, req.result, "सेल्स समारी की गिनती प्राप्त करें"));
});
exports.getAgentAllOrderList = asyncHandler(async (req, res) => {
  await OrderService.getAgentAllOrderList(req);
  return res.status(200).json(new Apiresponse(200, req.result, "एजेंट ऑर्डर लिस्ट प्राप्त करें"));
});
exports.getAgentOrderDetails = asyncHandler(async (req, res) => {
  await OrderService.getAgentOrderDetails(req);
  return res.status(200).json(new Apiresponse(200, req.result, "एजेंट ऑर्डर विवरण प्राप्त करें"));
});
exports.getAgentOrderSummaryCount = asyncHandler(async (req, res) => {
  await OrderService.getAgentOrderSummaryCount(req);
  return res.status(200).json(new Apiresponse(200, req.result, "एजेंट ऑर्डर समारी की गिनती प्राप्त करें"));
});


