const { Sequelize } = require("sequelize");
const { Content, ContentSchedule, ContentSlot, User, BroadcastLog } = require("../models");
const cacheService = require("./cache.service");
const { pickActiveScheduleForSlot } = require("./rotation.service");
const { sanitizeSubject } = require("../utils/subject");
const { CONTENT_STATUS, USER_ROLES } = require("../utils/constants");

const resolveTeacher = async (teacherPublicId) => {
  const teacher = await User.findOne({
    where: {
      publicId: teacherPublicId,
      role: USER_ROLES.TEACHER
    },
    attributes: ["id", "name", "publicId"]
  });

  return teacher;
};

const buildLiveItem = (req, slot, schedule) => ({
  contentId: schedule.content.id,
  title: schedule.content.title,
  description: schedule.content.description,
  subject: slot.subject,
  fileUrl: `${req.protocol}://${req.get("host")}/${schedule.content.filePath.replace(/\\/g, "/")}`,
  fileType: schedule.content.fileType,
  fileSize: schedule.content.fileSize,
  startTime: schedule.content.startTime,
  endTime: schedule.content.endTime,
  rotationOrder: schedule.rotationOrder,
  durationMinutes: schedule.durationMinutes
});

const getLiveContent = async (req, teacherPublicId, subjectQuery) => {
  const teacher = await resolveTeacher(teacherPublicId);
  if (!teacher) {
    return {
      teacherPublicId,
      items: []
    };
  }

  const sanitizedSubject = typeof subjectQuery === "string" ? sanitizeSubject(subjectQuery) : undefined;
  if (subjectQuery && !sanitizedSubject) {
    return {
      teacherPublicId: teacher.publicId,
      items: []
    };
  }

  const cacheKey = `live:${teacher.id}:${sanitizedSubject || "all"}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const slotWhere = { teacherId: teacher.id };
  if (sanitizedSubject) {
    slotWhere.subject = sanitizedSubject;
  }

  const slots = await ContentSlot.findAll({
    where: slotWhere,
    include: [
      {
        model: ContentSchedule,
        as: "schedules",
        required: false,
        include: [
          {
            model: Content,
            as: "content",
            where: {
              status: CONTENT_STATUS.APPROVED
            },
            required: true
          }
        ]
      }
    ],
    order: [
      ["subject", "ASC"],
      [{ model: ContentSchedule, as: "schedules" }, "rotationOrder", "ASC"]
    ]
  });

  const now = new Date();
  const activeItems = [];

  for (const slot of slots) {
    const activeSchedule = pickActiveScheduleForSlot(slot, slot.schedules || [], now);
    if (!activeSchedule) {
      continue;
    }
    activeItems.push({
      slot,
      schedule: activeSchedule
    });
  }

  if (activeItems.length) {
    await BroadcastLog.bulkCreate(
      activeItems.map((item) => ({
        contentId: item.schedule.content.id,
        teacherId: teacher.id,
        subject: item.slot.subject
      }))
    );
  }

  const response = {
    teacherPublicId: teacher.publicId,
    items: activeItems.map((item) => buildLiveItem(req, item.slot, item.schedule))
  };

  await cacheService.set(cacheKey, response);
  return response;
};

const getSubjectAnalytics = async () => {
  const servedData = await BroadcastLog.findAll({
    attributes: [
      "subject",
      [Sequelize.fn("COUNT", Sequelize.col("subject")), "servedCount"]
    ],
    group: ["subject"],
    order: [[Sequelize.literal("servedCount"), "DESC"]]
  });

  return {
    mostActiveSubject: servedData.length ? servedData[0].subject : null,
    usageBySubject: servedData.map((item) => ({
      subject: item.subject,
      servedCount: Number(item.get("servedCount"))
    }))
  };
};

module.exports = {
  getLiveContent,
  getSubjectAnalytics
};
