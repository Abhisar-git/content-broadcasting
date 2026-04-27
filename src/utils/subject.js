const sanitizeSubject = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
};

module.exports = {
  sanitizeSubject
};
