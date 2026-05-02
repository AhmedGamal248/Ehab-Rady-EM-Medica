require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { validateEnv } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");

const { isProduction, allowedOrigins } = validateEnv();
const app = express();
app.disable("x-powered-by");

// ===== Connect DB =====
connectDB();
app.set("trust proxy", 1);

// ===== Security =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  hsts: isProduction
    ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }
    : false,
  referrerPolicy: { policy: "no-referrer" },
}));

// ===== Compression =====
app.use(compression());

// ===== Logging =====
if (isProduction) {
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"), { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  app.use(morgan("dev"));
}

// ===== CORS =====
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
}));

// ===== Body Parser =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  const headerValue = req.headers["accept-language"];
  const acceptLanguage = Array.isArray(headerValue) ? headerValue[0] : headerValue || "";
  req.language = acceptLanguage.toLowerCase().startsWith("ar") ? "ar" : "en";
  next();
});

// ===== Backward-compatible Static Files =====
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "7d",
  immutable: true,
}));

// ===== Rate Limiting =====
app.use("/api", generalLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

// ===== Routes =====
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/upload", require("./routes/upload.routes"));

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

// ===== Error Handler =====
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));

const shutdown = (signal, exitCode = 0) => {
  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
    } finally {
      process.exit(exitCode);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
