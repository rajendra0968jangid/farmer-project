module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "orders",
    {
      orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      confirmationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalAmt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      orderFrom: {
        type: DataTypes.INTEGER,
        allowNull: false, // Agent / User ID
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true, // Agency Id
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dispatchDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM("paid", "unpaid", "partial_paid"),
        defaultValue: "unpaid",
        allowNull: true,
      },
      orderStatus: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "ready_to_dispatch",
          "dispatched",
          "delivered",
          "cancelled",
          "rejected"
        ),
        defaultValue: "pending",
      },
      deliveryCharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      handlingCharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
    }
  );
  return order;
};
