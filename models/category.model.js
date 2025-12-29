const { sequelize, DataTypes } = require("./db.model");

module.exports = (sequelize, DataTypes) => {
  const categories = sequelize.define(
    "categories",
    {
      CID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      CDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "categories",
      paranoid: true,
      timestamps: true,
    }
  );
  return categories;
};
