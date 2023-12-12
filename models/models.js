const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Item = sequelize.define('item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    typeId: {type: DataTypes.INTEGER, allowNull: false},
    subTypeId: {type: DataTypes.INTEGER, allowNull: false}
});

const Type = sequelize.define('type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    // hide: {type: DataTypes.BOOLEAN, defaultValue: false}
});

const SubType = sequelize.define('sub_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    // hide: {type: DataTypes.BOOLEAN, defaultValue: false}
})

const Review = sequelize.define('review', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    img: {type: DataTypes.STRING, allowNull: false}
});

const Work = sequelize.define('work', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    img: {type: DataTypes.STRING, allowNull: false}
});

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})

const SliderType = sequelize.define('slider_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    typeId: {type: DataTypes.INTEGER, allowNull: false},
    subTypeId: {type: DataTypes.INTEGER}
})

Type.hasMany(Item)
Item.belongsTo(Type)

Type.hasMany(SubType, {as: 'subType'});
SubType.belongsTo(Type)

module.exports = {
    Item,
    Type,
    Review,
    Work,
    User,
    SubType,
    SliderType
}