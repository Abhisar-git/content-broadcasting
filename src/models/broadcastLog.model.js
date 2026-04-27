const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BroadcastLog = sequelize.define(
  "BroadcastLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "content_id"
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "teacher_id"
    },
    subject: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    servedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "served_at"
    }
  },
  {
    tableName: "broadcast_logs",
    underscored: true,
    timestamps: false
  }
);

module.exports = BroadcastLog;
