
module.exports = (sequelize,DataTypes)=>{
    const loginlogs = sequelize.define(
        "loginlogs",
        {
            id : {
                type : DataTypes.INTEGER,
                primaryKey : true,
                autoIncrement : true
            },
            userId : {
                type : DataTypes.INTEGER, 
                allowNull : false
            },
            token : {
                type : DataTypes.TEXT,
                allowNull : true
            },
            isExpired :{
                type : DataTypes.BOOLEAN,
                allowNull : false,
                defaultValue : false,
            },
            fcmToken: {
                type: DataTypes.TEXT,
                allowNull: true
            },
        },
        {
            tableName : "loginlogs",
            timestamps : true,
            paranoid : false
        }
    );

    return loginlogs
};