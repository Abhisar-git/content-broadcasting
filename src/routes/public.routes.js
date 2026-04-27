const express = require("express");
const publicController = require("../controllers/public.controller");
const validate = require("../middlewares/validate.middleware");
const { liveParamSchema, liveQuerySchema } = require("../validations/content.validation");
const { publicLiveRateLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.get(
  "/live/:teacherPublicId",
  publicLiveRateLimiter,
  validate(liveParamSchema, "params"),
  validate(liveQuerySchema, "query"),
  publicController.getLiveContentByTeacher
);

module.exports = router;
