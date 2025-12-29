const { sequelize, DataTypes } = require("./db.model");

module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define(
    "products",
    {
      PID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CID: {
        type: DataTypes.INTEGER,
        allowNull: false, // Category ID
      },
      PName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      PDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      MRP: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unit:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      season: {
        type: DataTypes.STRING,
        allowNull: true, // Example: Summer, Winter, Rainy
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultvalue: "Active",
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "products",
      paranoid: false,
      timestamps: true,
    }
  );
  return products;
};
