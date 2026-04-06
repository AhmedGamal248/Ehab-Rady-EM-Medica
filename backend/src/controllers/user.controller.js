const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { success, error } = require("../utils/response");

const toAuthPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return error(res, "Email already exists", 400);

    const user = new User({ name, email: normalizedEmail, password });
    await user.save();

    const token = generateToken(user._id, user.role);
    success(res, {
      token,
      user: toAuthPayload(user),
    }, "Registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return error(res, "Invalid email or password", 401);

    const token = generateToken(user._id, user.role);
    success(res, {
      token,
      user: toAuthPayload(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").lean();
    success(res, users);
  } catch (err) {
    next(err);
  }
};
