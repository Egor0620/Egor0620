const AWS = require("aws-sdk");

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "us-east-1",
});

module.exports = s3Client;
