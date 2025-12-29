const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlerwares/verifyToken");
const { addCategory, getAllAgency, getAgencyAgent,getAllAgent, userDetails, uploadImage, addProduct, getcategoryList, getProductList, getProductDetails, updateProduct,deleteProduct, getOrderMetaData, updateProductStatus, updateCategoryStatus, deleteCategory, updateCategory, globleSearch, summaryCount} = require("../controllers/manufacturer.controller");
const {uploadMultiple} = require("../middlerwares/upload")
const {optionalVerifyToken} = require("../middlerwares/optionalVerifyToken")


router.get("/getAllAgency" , verifyToken , getAllAgency)
router.get("/getAgencyAgent" ,verifyToken , getAgencyAgent);
router.get("/getAllAgent" ,verifyToken , getAllAgent)
router.get("/userDetails" ,userDetails);
router.post("/addCategory", verifyToken, addCategory);
router.get("/getcategoryList", verifyToken, getcategoryList);
router.post("/addProduct", verifyToken, addProduct);
router.get("/getProductList",optionalVerifyToken, getProductList) ;
router.post("/uploadImage", uploadMultiple, uploadImage);
router.get("/getProductDetails", verifyToken, getProductDetails);
router.patch("/updateProduct", verifyToken, updateProduct);
router.delete("/deleteProduct", verifyToken, deleteProduct);
router.get("/getOrderMetaData", verifyToken, getOrderMetaData);
router.put("/updateCategoryStatus", verifyToken,updateCategoryStatus );
router.put("/updateProductStatus", verifyToken,updateProductStatus );
router.delete("/deleteCategory", verifyToken,deleteCategory );
router.put("/updateCategory", verifyToken,updateCategory );
router.get("/globlesearch", verifyToken, globleSearch)
router.get("/summaryCount", verifyToken, summaryCount)

module.exports = router;
