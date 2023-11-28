const aws = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const app = express();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  //  Bucket: process.env.AWS_BUCKET_NAME
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "ai_profile/" + Date.now().toString());
    },
  }),
});

module.exports = upload;
