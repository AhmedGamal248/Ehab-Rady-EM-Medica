const rateLimit = require("express-rate-limit");

exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "طلبات كتير جداً، استنى شوية" }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "حاولت كتير، استنى 15 دقيقة" }
});