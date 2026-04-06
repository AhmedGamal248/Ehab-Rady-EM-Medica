const { error } = require("../utils/response");

module.exports = (schema, property = "body") => (req, res, next) => {
  const { value, error: validationError } = schema.validate(req[property], {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (validationError) {
    return error(
      res,
      "Validation failed",
      400,
      validationError.details.map((detail) => detail.message)
    );
  }

  req[property] = value;
  next();
};
