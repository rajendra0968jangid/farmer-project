const notificationService = require("../services/notification.service");
const { Apiresponse } = require("../utils/apiResponse");

exports.getMyUnreadNotification = async(req, res,)=>{
    await notificationService.getMyUnreadNotification(req);
    return res.status(200).json(new Apiresponse(200, req.result, "नोटिफिकेशन सफलतापूर्वक मिल गए"))
}

exports.readNotification = async(req,res)=>{
    await notificationService.readNotification(req);
return res.status(200).json(new Apiresponse(200, req.result, "नोटिफिकेशन पढ़ लिया गया"))
}

exports.deleteNotification = async(req,res)=>{
    await notificationService.deleteNotification(req);
    return res.status(200).json(new Apiresponse(200, req.result, "नोटिफिकेशन सफलतापूर्वक हटा दिया गया"))
}

exports.markOrderDeliveredByAgency = async(req,res)=>{
    await notificationService.markOrderDeliveredByAgency(req);
    return res.status(200).json(new Apiresponse(200, req.result, "ऑर्डर सफलतापूर्वक डिलीवर मार्क कर दिया गया"))
}