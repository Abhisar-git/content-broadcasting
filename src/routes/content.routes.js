const express = require("express");
const contentController = require("../controllers/content.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const { uploadSingleImage } = require("../middlewares/upload.middleware");
const { USER_ROLES } = require("../utils/constants");
const validate = require("../middlewares/validate.middleware");
const { contentIdParamSchema, listContentQuerySchema } = require("../validations/content.validation");

const router = express.Router();

router.use(authenticate, authorizeRoles(USER_ROLES.TEACHER));

router.post("/", uploadSingleImage.single("file"), contentController.uploadContent);
router.get("/my", validate(listContentQuerySchema, "query"), contentController.listMyContents);
router.get(
  "/my/:contentId",
  validate(contentIdParamSchema, "params"),
  contentController.getMyContentById
);

module.exports = router;
