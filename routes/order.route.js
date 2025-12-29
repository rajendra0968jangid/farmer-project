const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlerwares/verifyToken");
const {orderCreate ,addToCart, deleteCartItem, getCartList ,updateCartQuantity ,getOrderHistory,getOrderDetails ,updateOrderStatus, commissionCreate, commissionPay,getCommissions , getCommissionsTransaction,pendingPayment , getPendingPayment, getAgencyOrderSummary, getAgencyAgentSalesSummary, getAgentAllOrderList,getAgentOrderDetails, getAgentOrderSummaryCount} = require("../controllers/order.controller");

router.post("/create-order", verifyToken, orderCreate);
router.get("/getOrderHistory", verifyToken, getOrderHistory);
router.get("/getOrderDetails", verifyToken, getOrderDetails);
router.put("/updateOrderStatus", verifyToken, updateOrderStatus);
router.post("/addToCart", verifyToken, addToCart);
router.get("/getCartList", verifyToken, getCartList);
router.delete("/deleteCartItem", verifyToken, deleteCartItem);
router.put("/updateCartQuantity", verifyToken, updateCartQuantity);
router.post("/commissionCreate", verifyToken, commissionCreate);
router.post("/commissionPay", verifyToken, commissionPay);
router.get("/getCommissions" , verifyToken ,getCommissions )
router.get("/getCommissionsTransaction" , verifyToken ,getCommissionsTransaction )
router.post("/pendingPayment"  ,verifyToken ,pendingPayment )
router.get("/getPendingPayment"  ,verifyToken ,getPendingPayment )
router.get("/getAgencyOrderSummary"  ,verifyToken ,getAgencyOrderSummary )
router.get("/getAgencyAgentSalesSummary"  ,verifyToken ,getAgencyAgentSalesSummary )
router.get("/getAgentAllOrderList"  ,verifyToken ,getAgentAllOrderList )
router.get("/getAgentOrderDetails"  ,verifyToken ,getAgentOrderDetails )
router.get("/getAgentOrderSummaryCount"  ,verifyToken ,getAgentOrderSummaryCount )

module.exports = router;
