const router = require("express").Router();
const savedCtl = require("../controllers/saved");
const verifyAuth = require("../middleware/auth");

router.get("/all", verifyAuth, savedCtl.getAllSaved);
router.get("/:savedId", verifyAuth, savedCtl.getSavedDetail);
router.post("/create", verifyAuth, savedCtl.createSaved);
router.post("/filter", verifyAuth, savedCtl.getSavedByFilter);
router.post("/get", verifyAuth, savedCtl.getSavedByPage);

module.exports = router;
