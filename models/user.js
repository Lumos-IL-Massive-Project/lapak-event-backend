'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    profile_image: DataTypes.STRING,
    role: DataTypes.ENUM('user', 'admin', 'event organizer'),
    status: DataTypes.ENUM('active', 'inactive'),
    otp: DataTypes.STRING(6),
    otp_expired_date: DataTypes.DATE,
    password: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};