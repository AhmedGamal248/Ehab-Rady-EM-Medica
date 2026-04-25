const { uploadImageBuffer } = require("../config/cloudinary");
const { success, error } = require("../utils/response");

exports.uploadImages = async (req, res, next) => {
  try {
    const files = req.files || [];

    if (!files.length) {
      return error(res, "No images were uploaded", 400);
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => uploadImageBuffer(file))
    );

    const data = {
      urls: uploadedFiles.map((file) => file.secure_url),
      files: uploadedFiles.map((file) => ({
        url: file.secure_url,
        publicId: file.public_id,
        width: file.width,
        height: file.height,
        format: file.format,
      })),
    };

    return success(res, data, "Images uploaded successfully", 201);
  } catch (err) {
    err.code = "CLOUDINARY_UPLOAD_FAILED";
    err.statusCode = 502;
    err.message = err.message || "Image upload to Cloudinary failed";
    next(err);
  }
};
