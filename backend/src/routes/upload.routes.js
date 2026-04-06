const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

// رفع صورة واحدة
router.post("/single", auth, admin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "مفيش صورة" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// رفع أكتر من صورة
router.post("/multiple", auth, admin, upload.array("images", 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: "مفيش صور" });
  const urls = req.files.map(
    (f) => `${req.protocol}://${req.get("host")}/uploads/products/${f.filename}`
  );
  res.json({ urls });
});

module.exports = router;