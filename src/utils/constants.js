const USER_ROLES = Object.freeze({
  PRINCIPAL: "principal",
  TEACHER: "teacher"
});

const CONTENT_STATUS = Object.freeze({
  UPLOADED: "uploaded",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
});

module.exports = {
  USER_ROLES,
  CONTENT_STATUS
};
