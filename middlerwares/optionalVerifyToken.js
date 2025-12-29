const jwt = require("jsonwebtoken");
const db = require("../models/db.model");

const Users = db.users;

const optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // 🔹 Token nahi hai → public access allow
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findByPk(decoded.id, {
      where: { deletedAt: null },
    });

    if (user && user.status !== "Inactive") {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (err) {
    // 🔹 Invalid token bhi ho → public access
    req.user = null;
    next();
  }
};

module.exports = { optionalVerifyToken };
