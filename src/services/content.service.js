const sequelize = require("../config/database");
const env = require("../config/env");
const { Content, ContentSchedule, ContentSlot, User } = require("../models");
const ApiError = require("../utils/apiError");
const { CONTENT_STATUS, USER_ROLES } = require("../utils/constants");
const { sanitizeSubject } = require("../utils/subject");
const cacheService = require("./cache.service");
const storageService = require("./storage.service");

const parseDateValue = (value, fieldName) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldName} is not a valid date-time`);
  }
  return date;
};

const buildFileUrl = (req, filePathValue) => {
  if (filePathValue.startsWith("http://") || filePathValue.startsWith("https://")) {
    return filePathValue;
  }
  const normalizedPath = filePathValue.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
};

const mapContent = (req, content) => ({
  id: content.id,
  title: content.title,
  description: content.description,
  subject: content.subject,
  fileUrl: buildFileUrl(req, content.filePath),
  fileType: content.fileType,
  fileSize: content.fileSize,
  status: content.status,
  startTime: content.startTime,
  endTime: content.endTime,
  rejectionReason: content.rejectionReason,
  approvedBy: content.approvedBy,
  approvedAt: content.approvedAt,
  teacher: content.teacher
    ? {
        id: content.teacher.id,
        name: content.teacher.name,
        email: content.teacher.email,
        publicId: content.teacher.publicId
      }
    : null,
  schedule: content.schedule
    ? {
        rotationOrder: content.schedule.rotationOrder,
        durationMinutes: content.schedule.durationMinutes,
        slotId: content.schedule.slotId
      }
    : null,
  createdAt: content.createdAt
});

const createContent = async (req, teacherId, payload, file) => {
  if (!file) {
    throw new ApiError(400, "File is required");
  }

  const title = (payload.title || "").trim();
  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const subject = sanitizeSubject(payload.subject);
  if (!subject) {
    throw new ApiError(400, "Subject is required and must contain only letters/numbers/hyphens");
  }

  const hasStartTime = Boolean(payload.startTime);
  const hasEndTime = Boolean(payload.endTime);
  if (hasStartTime !== hasEndTime) {
    throw new ApiError(400, "Both startTime and endTime must be provided together");
  }

  let startTime = null;
  let endTime = null;
  if (hasStartTime && hasEndTime) {
    startTime = parseDateValue(payload.startTime, "startTime");
    endTime = parseDateValue(payload.endTime, "endTime");
    if (startTime >= endTime) {
      throw new ApiError(400, "startTime must be earlier than endTime");
    }
  }

  const rotationDuration = payload.rotationDurationMinutes
    ? Number(payload.rotationDurationMinutes)
    : env.upload.defaultRotationMinutes;
  if (!Number.isInteger(rotationDuration) || rotationDuration <= 0) {
    throw new ApiError(400, "rotationDurationMinutes must be a positive integer");
  }

  const result = await sequelize.transaction(async (transaction) => {
    const storedFilePath = await storageService.persistUploadedFile(file);

    const content = await Content.create(
      {
        title,
        description: payload.description || null,
        subject,
        filePath: storedFilePath,
        fileType: file.mimetype,
        fileSize: file.size,
        startTime,
        endTime,
        uploadedBy: teacherId,
        status: CONTENT_STATUS.UPLOADED
      },
      { transaction }
    );

    const [slot] = await ContentSlot.findOrCreate({
      where: { subject, teacherId },
      defaults: { subject, teacherId },
      transaction
    });

    const maxOrder = await ContentSchedule.max("rotationOrder", {
      where: { slotId: slot.id },
      transaction
    });
    const nextOrder = Number.isInteger(maxOrder) ? maxOrder + 1 : 1;

    await ContentSchedule.create(
      {
        contentId: content.id,
        slotId: slot.id,
        rotationOrder: nextOrder,
        durationMinutes: rotationDuration
      },
      { transaction }
    );

    content.status = CONTENT_STATUS.PENDING;
    await content.save({ transaction });

    return content;
  });

  await cacheService.delByPrefix(`live:${teacherId}:`);

  const createdContent = await Content.findByPk(result.id, {
    include: [
      { model: User, as: "teacher", attributes: ["id", "name", "email", "publicId", "role"] },
      { model: ContentSchedule, as: "schedule" }
    ]
  });

  return mapContent(req, createdContent);
};

const listTeacherContents = async (req, teacherId, query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;
  const offset = (page - 1) * limit;

  const where = {
    uploadedBy: teacherId
  };

  if (query.status) {
    where.status = query.status.toLowerCase();
  }

  if (query.subject) {
    const subject = sanitizeSubject(query.subject);
    if (!subject) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
    where.subject = subject;
  }

  const { rows, count } = await Content.findAndCountAll({
    where,
    include: [{ model: ContentSchedule, as: "schedule" }],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    items: rows.map((item) => mapContent(req, item)),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getTeacherContentById = async (req, teacherId, contentId) => {
  const content = await Content.findOne({
    where: {
      id: contentId,
      uploadedBy: teacherId
    },
    include: [
      { model: ContentSchedule, as: "schedule" },
      { model: User, as: "approver", attributes: ["id", "name", "email"] }
    ]
  });

  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  const mapped = mapContent(req, content);
  mapped.approver = content.approver
    ? { id: content.approver.id, name: content.approver.name, email: content.approver.email }
    : null;
  return mapped;
};

const listAllContentsForPrincipal = async (req, query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (query.status) {
    where.status = query.status.toLowerCase();
  }
  if (query.teacherId) {
    where.uploadedBy = Number(query.teacherId);
  }
  if (query.subject) {
    const subject = sanitizeSubject(query.subject);
    if (!subject) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
    where.subject = subject;
  }

  const { rows, count } = await Content.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "teacher",
        where: { role: USER_ROLES.TEACHER },
        attributes: ["id", "name", "email", "publicId"],
        required: true
      },
      {
        model: User,
        as: "approver",
        attributes: ["id", "name", "email"],
        required: false
      },
      { model: ContentSchedule, as: "schedule", required: false }
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit
  });

  return {
    items: rows.map((item) => mapContent(req, item)),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const listPendingContents = async (req, query = {}) => {
  return listAllContentsForPrincipal(req, { ...query, status: CONTENT_STATUS.PENDING });
};

const updateContentStatus = async (principalId, contentId, status, rejectionReason = null) => {
  const content = await Content.findByPk(contentId);
  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  if (content.status !== CONTENT_STATUS.PENDING) {
    throw new ApiError(400, "Only pending content can be approved or rejected");
  }

  if (status === CONTENT_STATUS.REJECTED && !rejectionReason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  content.status = status;
  content.approvedBy = principalId;
  content.approvedAt = new Date();
  content.rejectionReason = status === CONTENT_STATUS.REJECTED ? rejectionReason : null;
  await content.save();

  await cacheService.delByPrefix(`live:${content.uploadedBy}:`);
  return content;
};

module.exports = {
  createContent,
  listTeacherContents,
  getTeacherContentById,
  listAllContentsForPrincipal,
  listPendingContents,
  updateContentStatus,
  mapContent
};
