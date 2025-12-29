const jwt = require("jsonwebtoken");
const db = require("../models/db.model");
const { Apiresponse } = require("../utils/apiResponse");

const User = db.users;

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json(new Apiresponse(401, null, "टोकन नहीं मिला"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    req.jwtToken = token;   // 🔥 JWT token save
    req.userId = decoded.id;
    // res.json(req.user)

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json(new Apiresponse(401, null, "यूज़र नहीं मिला"));
    }
    if (user.deletedAt !== null) {
      return res.status(401).json(new Apiresponse(401, null, "अकाउंट हटाया जा चुका है"))
    }
    if (user.status === "Inactive") {
      return res.status(401).json(new Apiresponse(401, null, "आपका अकाउंट बंद है, कृपया एडमिन से संपर्क करें"));
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new Apiresponse(401, null, "अमान्य टोकन"));
  }
};
