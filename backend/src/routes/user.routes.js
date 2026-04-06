const express = require("express");
const router = express.Router();
const { register, login, getAllUsers } = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validation/schemas");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/", auth, admin, getAllUsers);

module.exports = router;
