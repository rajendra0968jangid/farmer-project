module.exports = (sequelize, DataTypes) => {
  const OrderPayment = sequelize.define(
    "order_payments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      paidBy: {
        type: DataTypes.INTEGER, // user id
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      paymentMode: {
        type: DataTypes.ENUM("cash", "online", "upi", "wallet"),
        allowNull: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "order_payments",
      timestamps: true,
    }
  );
  return OrderPayment;
};
