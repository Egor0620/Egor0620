const router = require("express").Router();
const constantCtl = require("../controllers/constant");

router.get("/goal", constantCtl.getTypeGoal);
router.get("/voice", constantCtl.getTypeVoice);
router.get("/imagery", constantCtl.getTypeImage);

module.exports = router;
