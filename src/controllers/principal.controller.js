const asyncHandler = require("../utils/asyncHandler");
const contentService = require("../services/content.service");
const analyticsService = require("../services/analytics.service");
const { CONTENT_STATUS } = require("../utils/constants");

const listAllContents = asyncHandler(async (req, res) => {
  const result = await contentService.listAllContentsForPrincipal(req, req.query);
  res.status(200).json({
    success: true,
    data: result
  });
});

const listPendingContents = asyncHandler(async (req, res) => {
  const result = await contentService.listPendingContents(req, req.query);
  res.status(200).json({
    success: true,
    data: result
  });
});

const approveContent = asyncHandler(async (req, res) => {
  await contentService.updateContentStatus(
    req.user.id,
    Number(req.params.contentId),
    CONTENT_STATUS.APPROVED
  );
  res.status(200).json({
    success: true,
    message: "Content approved successfully"
  });
});

const rejectContent = asyncHandler(async (req, res) => {
  await contentService.updateContentStatus(
    req.user.id,
    Number(req.params.contentId),
    CONTENT_STATUS.REJECTED,
    req.body.reason
  );
  res.status(200).json({
    success: true,
    message: "Content rejected successfully"
  });
});

const subjectAnalytics = asyncHandler(async (_req, res) => {
  const result = await analyticsService.getPrincipalSubjectAnalytics();
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  listAllContents,
  listPendingContents,
  approveContent,
  rejectContent,
  subjectAnalytics
};
