const router = require("express").Router();

const verifyAuth = require("../middleware/auth");
const userRouter = require("../controllers/user");

router.get("/users/:ainame", verifyAuth, userRouter.getUserWithUsername);
router.post("/users/follower", verifyAuth, userRouter.follower);

module.exports = router;
