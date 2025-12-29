module.exports = (sequelize, DataTypes) => {
  const bankdetails = sequelize.define(
    "bankdetails",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accHolder: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNo: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      ifscCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      upiId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      QR: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
      },
    },
    {
      tableName: "bankdetails",
    }
  );
  return bankdetails;
};
