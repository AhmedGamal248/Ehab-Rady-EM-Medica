const { error } = require("../utils/response");

module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return error(res, `${field} already exists`, 400);
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return error(res, "Validation failed", 400, errors);
  }

  if (err.name === "CastError") {
    return error(res, "Invalid id", 400);
  }

  if (err.name === "JsonWebTokenError") {
    return error(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return error(res, "Token expired", 401);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return error(res, "Image size must be 5 MB or less", 400);
    }

    return error(res, err.message || "Upload failed", 400);
  }

  if (err.code === "CLOUDINARY_UPLOAD_FAILED") {
    return error(res, "Image upload failed. Please try again.", err.statusCode || 502);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  return error(res, message, statusCode);
};
