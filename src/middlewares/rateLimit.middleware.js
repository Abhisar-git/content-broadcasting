const rateLimit = require("express-rate-limit");

const publicLiveRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please retry after a minute."
  }
});

module.exports = {
  publicLiveRateLimiter
};
