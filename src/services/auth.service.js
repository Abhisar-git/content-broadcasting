const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const env = require("../config/env");
const { User } = require("../models");
const ApiError = require("../utils/apiError");
const { USER_ROLES } = require("../utils/constants");

const createJwtToken = (user) =>
  jwt.sign({ role: user.role, publicId: user.publicId || null }, env.jwt.secret, {
    subject: String(user.id),
    expiresIn: env.jwt.expiresIn
  });

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  publicId: user.publicId
});

const registerTeacher = async ({ name, email, password }) => {
  const existing = await User.findOne({
    where: {
      email: {
        [Op.eq]: email
      }
    }
  });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: USER_ROLES.TEACHER
  });

  user.publicId = `teacher-${user.id}`;
  await user.save();

  return toSafeUser(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    token: createJwtToken(user),
    user: toSafeUser(user)
  };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return toSafeUser(user);
};

const ensureDefaultPrincipalAccount = async () => {
  const existingPrincipal = await User.findOne({
    where: {
      email: env.defaultPrincipal.email,
      role: USER_ROLES.PRINCIPAL
    }
  });

  if (existingPrincipal) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.defaultPrincipal.password, 10);
  await User.create({
    name: env.defaultPrincipal.name,
    email: env.defaultPrincipal.email,
    passwordHash,
    role: USER_ROLES.PRINCIPAL
  });

  console.info(
    `[BOOTSTRAP] Created default principal (${env.defaultPrincipal.email}). Change password after first login.`
  );
};

module.exports = {
  registerTeacher,
  login,
  getProfile,
  ensureDefaultPrincipalAccount
};
