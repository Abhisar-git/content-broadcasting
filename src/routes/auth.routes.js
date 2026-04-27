const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { registerTeacherSchema, loginSchema } = require("../validations/auth.validation");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", validate(registerTeacherSchema), authController.registerTeacher);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
