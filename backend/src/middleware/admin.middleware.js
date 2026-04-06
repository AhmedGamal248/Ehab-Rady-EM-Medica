const { error } = require("../utils/response");

module.exports = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return error(res, "Admin privileges are required", 403);
  }

  next();
};
