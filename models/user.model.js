module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
       
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobileNo: {
        type: DataTypes.STRING,
        allowNull: false,
        
      },
      email: {
  type: DataTypes.STRING,
  allowNull: true,
  validate: {
    isEmail: true,
  },
},

      userType: {
        type: DataTypes.ENUM("Manufacturer", "Agency", "Agent"),
        defaultValue: "Agent",
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
      },
      generatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isPassword:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
      },
      wallet:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue: 0.0,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "users",
      paranoid: false,
      timestamps: true,
    }
  );

  return users;
};
