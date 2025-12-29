module.exports = (sequelize, DataTypes) => {
  const payment = sequelize.define(
    "payments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      paymentMode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      txnId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Confirmed"),
        defaultValue: "Pending",
        allowNull: false,
      },
    },
    {
      tableName: "payments",
      timestamps: true,
    }
  );

  return payment;
};
