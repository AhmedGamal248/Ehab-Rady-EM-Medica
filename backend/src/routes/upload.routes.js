const express = require("express");
const upload = require("../config/upload");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const { uploadImages } = require("../controllers/upload.controller");

const router = express.Router();

router.post("/", auth, admin, upload.array("images", 5), uploadImages);

module.exports = router;
