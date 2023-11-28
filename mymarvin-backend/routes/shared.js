const router = require("express").Router();
const sharedCtl = require("../controllers/shared");
const savedCtl = require("../controllers/saved");
const verifyAuth = require("../middleware/auth");

router.post("/create", verifyAuth, sharedCtl.createShared);
router.get("/:savedId", savedCtl.getSavedDetail);

module.exports = router;
