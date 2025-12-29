module.exports = (sequelize, DataTypes) => {
  const orderitems = sequelize.define(
    "orderitems",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false, // FK to orders
      },
      PID: {
        type: DataTypes.INTEGER,
        allowNull: false, // Product ID
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      MRP: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
    },
    {
      tableName: "orderitems",
      timestamps: true,
    }
  );
  return orderitems;
};
