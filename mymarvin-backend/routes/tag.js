const router = require("express").Router();
const tagCtl = require("../controllers/tag");
const verifyAuth = require("../middleware/auth");

router.get("/all-private", verifyAuth, tagCtl.getTags);
router.get("/all", verifyAuth, tagCtl.getAllTags);
router.post("/create", verifyAuth, tagCtl.createTag);

module.exports = router;
