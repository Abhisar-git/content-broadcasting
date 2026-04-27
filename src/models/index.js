const User = require("./user.model");
const Content = require("./content.model");
const ContentSlot = require("./contentSlot.model");
const ContentSchedule = require("./contentSchedule.model");
const BroadcastLog = require("./broadcastLog.model");

User.hasMany(Content, { foreignKey: "uploadedBy", as: "uploadedContents" });
User.hasMany(Content, { foreignKey: "approvedBy", as: "approvedContents" });
User.hasMany(ContentSlot, { foreignKey: "teacherId", as: "slots" });
User.hasMany(BroadcastLog, { foreignKey: "teacherId", as: "broadcastLogs" });

Content.belongsTo(User, { foreignKey: "uploadedBy", as: "teacher" });
Content.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });
Content.hasOne(ContentSchedule, { foreignKey: "contentId", as: "schedule" });
Content.hasMany(BroadcastLog, { foreignKey: "contentId", as: "broadcastLogs" });

ContentSlot.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });
ContentSlot.hasMany(ContentSchedule, { foreignKey: "slotId", as: "schedules" });

ContentSchedule.belongsTo(Content, { foreignKey: "contentId", as: "content" });
ContentSchedule.belongsTo(ContentSlot, { foreignKey: "slotId", as: "slot" });

BroadcastLog.belongsTo(Content, { foreignKey: "contentId", as: "content" });
BroadcastLog.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

module.exports = {
  User,
  Content,
  ContentSlot,
  ContentSchedule,
  BroadcastLog
};
