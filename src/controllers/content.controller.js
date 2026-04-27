const asyncHandler = require("../utils/asyncHandler");
const contentService = require("../services/content.service");

const uploadContent = asyncHandler(async (req, res) => {
  const content = await contentService.createContent(req, req.user.id, req.body, req.file);
  res.status(201).json({
    success: true,
    message: "Content uploaded successfully and sent for approval",
    data: content
  });
});

const listMyContents = asyncHandler(async (req, res) => {
  const result = await contentService.listTeacherContents(req, req.user.id, req.query);
  res.status(200).json({
    success: true,
    data: result
  });
});

const getMyContentById = asyncHandler(async (req, res) => {
  const result = await contentService.getTeacherContentById(req, req.user.id, Number(req.params.contentId));
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  uploadContent,
  listMyContents,
  getMyContentById
};
