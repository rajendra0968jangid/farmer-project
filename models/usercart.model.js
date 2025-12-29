module.exports = (sequelize, DataTypes) => {
  const usercarts = sequelize.define(
    "usercarts",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      PID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      MRP: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
    },
    {
      tableName: "usercarts",
      timestamps: true,
    }
  );

  return usercarts;
};
