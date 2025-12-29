module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "notifications",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {          // receiverId
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      readReceipt: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDelivered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pageName: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "notifications",
    }
  );
  return Notification;
};
