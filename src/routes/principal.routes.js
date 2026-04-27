const express = require("express");
const principalController = require("../controllers/principal.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  contentIdParamSchema,
  rejectContentSchema,
  listContentQuerySchema
} = require("../validations/content.validation");
const { USER_ROLES } = require("../utils/constants");

const router = express.Router();

router.use(authenticate, authorizeRoles(USER_ROLES.PRINCIPAL));

router.get(
  "/content",
  validate(listContentQuerySchema, "query"),
  principalController.listAllContents
);
router.get(
  "/content/pending",
  validate(listContentQuerySchema, "query"),
  principalController.listPendingContents
);
router.patch(
  "/content/:contentId/approve",
  validate(contentIdParamSchema, "params"),
  principalController.approveContent
);
router.patch(
  "/content/:contentId/reject",
  validate(contentIdParamSchema, "params"),
  validate(rejectContentSchema),
  principalController.rejectContent
);
router.get("/analytics/subjects", principalController.subjectAnalytics);

module.exports = router;
