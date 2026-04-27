const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { USER_ROLES } = require("../utils/constants");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash"
    },
    role: {
      type: DataTypes.ENUM(USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER),
      allowNull: false
    },
    publicId: {
      type: DataTypes.STRING(80),
      allowNull: true,
      unique: true,
      field: "public_id"
    }
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = User;
