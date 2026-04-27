const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContentSchedule = sequelize.define(
  "ContentSchedule",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "content_id"
    },
    slotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "slot_id"
    },
    rotationOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "rotation_order"
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "duration_minutes"
    }
  },
  {
    tableName: "content_schedules",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = ContentSchedule;
