const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connect("mongodb://127.0.0.1:27017/medical-store");

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
