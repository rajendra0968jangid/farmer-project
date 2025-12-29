// models/userFcmToken.model.js
module.exports = (sequelize, DataTypes) => {
  const user_fcm_tokens = sequelize.define(
    "userfcmtoken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fcmToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deviceInfo: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "userfcmtoken",
      timestamps: false,
    }
  );

  return user_fcm_tokens;
};