
module.exports = (sequelize, DataTypes) => {
    const banners = sequelize.define("Banner", {
        imageUrl: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
        {
            tableName: "banners",
            timestamps: true
        })
    return banners
}