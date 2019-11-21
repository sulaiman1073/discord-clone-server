const multer = require("multer");
const { extname } = require("path");
const config = require("../../config");
const { ApiError } = require("../errors");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true);
    }

    cb(new ApiError("Only jpg/jpeg/png image files are allowed", 400));
  },
  limits: { fileSize: 2000000 }
});

module.exports = upload;
