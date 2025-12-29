const { Sequelize, DataTypes, Op } = require("sequelize");
const dbConfig = require("../config/db.config");
const users = require("./user.model");
const categories = require("./category.model");
const products = require("./product.model");
const address = require("./address.model");
const bankdetails = require("./bankDetail.model");
const orders = require("./order.model");
const orderitems = require("./orderItem.model");
const usercarts = require("./usercart.model");
const payments = require("./payment.model");
const bannersModel = require("./banners.model");
const commission = require("./commission.model");
const txncommission = require("./txncommission.model");
const userfcmtoken = require("./userFcmToken.model");
const notification = require("./notifications.model");
const loginlogsModel = require("./loginlogs.model");
const orderpayment = require("./order_payments.model");
const version = require("../models/version.model");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: "mysql",
  logging: false,
});

const db = {
  Sequelize: Sequelize,
  DataTypes: DataTypes,
  sequelize: sequelize,
  Op: Op,
  users: users(sequelize, DataTypes),
  categories: categories(sequelize, DataTypes),
  products: products(sequelize, DataTypes),
  address: address(sequelize, DataTypes),
  bankdetails: bankdetails(sequelize, DataTypes),
  orders: orders(sequelize, DataTypes),
  orderitems: orderitems(sequelize, DataTypes),
  usercarts: usercarts(sequelize, DataTypes),
  payments: payments(sequelize, DataTypes),
  loginlogs: loginlogsModel(sequelize, DataTypes),
  banners: bannersModel(sequelize, DataTypes),
  commissions: commission(sequelize, DataTypes),
  txncommissions: txncommission(sequelize, DataTypes),
  userfcmtoken: userfcmtoken(sequelize, DataTypes),
  notification: notification(sequelize, DataTypes),
  orderpayments:orderpayment(sequelize ,DataTypes),
   version: version(sequelize, DataTypes),
};
// Associations
db.users.hasMany(db.userfcmtoken, { foreignKey: "userId", as: "fcmTokens" });
db.userfcmtoken.belongsTo(db.users, { foreignKey: "userId", as: "user" });

db.users.belongsTo(db.users, { foreignKey: "generatedBy" });
db.users.hasMany(db.users, { foreignKey: "generatedBy" });

// address -> users
db.users.hasOne(db.address, { foreignKey: "userId", as: "address" });
db.address.belongsTo(db.users, { foreignKey: "userId", as: "user" });

//bankdetails -> users
db.users.hasOne(db.bankdetails, { foreignKey: "userId", as: "bankdetails" });
db.bankdetails.belongsTo(db.users, { foreignKey: "userId", as: "user" });

//product -> categories
db.categories.hasMany(db.products, { foreignKey: "CID", as: "products" });
db.products.belongsTo(db.categories, { foreignKey: "CID", as: "category" });

//order -> orderItems
db.orders.hasMany(db.orderitems, { foreignKey: "orderId", as: "orderitems" });
db.orderitems.belongsTo(db.orders, { foreignKey: "orderId", as: "order" });

//orderItems -> product
db.products.hasMany(db.orderitems, { foreignKey: "PID", as: "productItem" });
db.orderitems.belongsTo(db.products, { foreignKey: "PID", as: "product" });

// produt -> usercarts
db.products.hasMany(db.usercarts, { foreignKey: "PID" });
db.usercarts.belongsTo(db.products, { foreignKey: "PID" });

// user -> order
db.users.hasMany(db.orders, { foreignKey: "orderFrom" });
db.orders.belongsTo(db.users, { foreignKey: "orderFrom" });

db.commissions.hasMany(db.txncommissions, { foreignKey: "commissionId", as: "transactions" });
db.txncommissions.belongsTo(db.commissions, { foreignKey: "commissionId", as: "commission" });



// ===== HOOKS – TOKEN EXPIRY ON SOFT DELETE & STATUS INACTIVE =====
// ये कोड db.model.js के सबसे नीचे डाल दो (module.exports = db; से ठीक पहले)

if (db.users && db.loginlogs) {
  // 1. Soft Delete पर token expire
  db.users.addHook("beforeDestroy", async (user, options) => {
    await db.loginlogs.update(
      { isExpired: true, token: null },
      { where: { userId: user.id }, transaction: options.transaction }
    );
  });

  // 2. Status "Inactive" करने पर token expire
  db.users.addHook("afterUpdate", async (user, options) => {
    if (user.changed("status") && user.status === "Inactive") {
      await db.loginlogs.update(
        { isExpired: true, token: null },
        { where: { userId: user.id }, transaction: options.transaction }
      );
    }
  });
}

module.exports = db;
