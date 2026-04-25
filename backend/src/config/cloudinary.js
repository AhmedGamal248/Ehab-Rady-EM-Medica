const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const DEFAULT_UPLOAD_FOLDER = "medical-store/products";

const uploadImageBuffer = (file, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options,
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure URL"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });

module.exports = {
  cloudinary,
  uploadImageBuffer,
};
