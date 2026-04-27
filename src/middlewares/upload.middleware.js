const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const uploadDirectory = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  }
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/gif"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".gif"]);

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
    callback(new ApiError(400, "Only JPG, PNG, and GIF files are allowed"));
    return;
  }
  callback(null, true);
};

const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxUploadMb * 1024 * 1024
  }
});

module.exports = {
  uploadSingleImage
};
