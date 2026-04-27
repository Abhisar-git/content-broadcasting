const asyncHandler = require("../utils/asyncHandler");
const liveService = require("../services/live.service");

const getLiveContentByTeacher = asyncHandler(async (req, res) => {
  const result = await liveService.getLiveContent(
    req,
    req.params.teacherPublicId,
    req.query.subject
  );

  if (!result.items.length) {
    return res.status(200).json({
      success: true,
      message: "No content available",
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    message: "Live content fetched successfully",
    data: result.items
  });
});

module.exports = {
  getLiveContentByTeacher
};
