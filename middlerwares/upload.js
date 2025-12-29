const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const s3 = require("../config/s3.config");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      const fileName = `upload/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 500 * 1024 },
});

module.exports = {
  uploadSingle: upload.single("image"),
  uploadMultiple: upload.array("image", 10),
};
