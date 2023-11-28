const router = require("express").Router();
const authCtl = require("../controllers/facebook");
const verifyAuth = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/page", verifyAuth, authCtl.getPageFacebook);
router.get("/feed", verifyAuth, authCtl.getFeeds);
router.post("/file", upload.single("file"), verifyAuth, authCtl.uploadFileS3);
router.post("/feed", verifyAuth, authCtl.createFeed);
router.post("/feed/schedule", verifyAuth, authCtl.createSchedulePost);
router.put("/feed/:feedId", verifyAuth, authCtl.updateFeed);
router.put("/page/:pageId", verifyAuth, authCtl.updatePageFacebook);
router.delete("/feed/:feedId", verifyAuth, authCtl.deleteFeed);
router.put("/feed/:feedId/publishing", verifyAuth, authCtl.publishFeedToFacebook);
router.get("/feed/random", authCtl.getRandomFeeds);
router.get("/image/ai", verifyAuth, authCtl.createImageByOpenAi);
router.get("/feed/suggestion", verifyAuth, authCtl.getFeedsUnPublish);

module.exports = router;
