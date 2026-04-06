const DEFAULT_DEV_CLIENT_URL = "http://localhost:5173";
const LOCAL_MONGO_PATTERN =
  /^mongodb(?:\+srv)?:\/\/(?:[^@]+@)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i;

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CLIENT_URL;

  if (!configuredOrigins && !isProduction) {
    return [DEFAULT_DEV_CLIENT_URL];
  }

  return parseOrigins(configuredOrigins || "");
};

const validateEnv = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];

  if (isProduction) {
    required.push("CLIENT_URL");
  }

  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (isProduction && LOCAL_MONGO_PATTERN.test(process.env.MONGO_URI)) {
    throw new Error("MONGO_URI must point to a cloud-hosted database in production");
  }

  const allowedOrigins = getAllowedOrigins();

  if (isProduction && allowedOrigins.length === 0) {
    throw new Error("CLIENT_URL must contain at least one production frontend URL");
  }

  return {
    isProduction,
    allowedOrigins,
  };
};

module.exports = {
  DEFAULT_DEV_CLIENT_URL,
  getAllowedOrigins,
  isProduction,
  validateEnv,
};
