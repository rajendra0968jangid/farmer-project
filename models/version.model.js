module.exports = (sequelize, DataTypes) => {
  const Version = sequelize.define("version", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    required:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
    }
  },
  {
    tableName:"version"
  })
  return Version;
};
