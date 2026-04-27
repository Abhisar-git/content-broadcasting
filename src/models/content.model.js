const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { CONTENT_STATUS } = require("../utils/constants");

const Content = sequelize.define(
  "Content",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "file_path"
    },
    fileType: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "file_type"
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "file_size"
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_time"
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_time"
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "uploaded_by"
    },
    status: {
      type: DataTypes.ENUM(
        CONTENT_STATUS.UPLOADED,
        CONTENT_STATUS.PENDING,
        CONTENT_STATUS.APPROVED,
        CONTENT_STATUS.REJECTED
      ),
      allowNull: false,
      defaultValue: CONTENT_STATUS.PENDING
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "rejection_reason"
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "approved_by"
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at"
    }
  },
  {
    tableName: "contents",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = Content;
