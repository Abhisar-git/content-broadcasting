const multer = require("multer");

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE" ? "File too large. Max size limit exceeded." : error.message;
    return res.status(400).json({
      success: false,
      message
    });
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Internal server error"
  };

  if (error.details) {
    response.details = error.details;
  }

  if (statusCode >= 500) {
    console.error("[SERVER ERROR]", error);
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
