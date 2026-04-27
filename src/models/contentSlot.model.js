const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContentSlot = sequelize.define(
  "ContentSlot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    subject: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "teacher_id"
    }
  },
  {
    tableName: "content_slots",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["subject", "teacher_id"]
      }
    ]
  }
);

module.exports = ContentSlot;
