const { sequelize, DataTypes } = require("./db.model");

module.exports = (sequelize, DataTypes) => {
  const commissions = sequelize.define(
    "commissions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      agencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      commissionAmt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      paymentMode: {
        type: DataTypes.ENUM("cash", "online", "upi", "wallet"),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "partial_paid", "paid"),
        defaultValue: "pending",
      },
      commissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "commissions",
      timestamps: true,
    }
  );
  return commissions;
};
