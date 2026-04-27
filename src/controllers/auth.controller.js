const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const registerTeacher = asyncHandler(async (req, res) => {
  const user = await authService.registerTeacher(req.body);
  res.status(201).json({
    success: true,
    message: "Teacher registered successfully",
    data: user
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result
  });
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: profile
  });
});

module.exports = {
  registerTeacher,
  login,
  me
};
