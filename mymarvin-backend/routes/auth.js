const router = require("express").Router();
const authCtl = require("../controllers/auth");
const verifyAuth = require("../middleware/auth");
// const upload = require("../middleware/upload");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/login", authCtl.login);
router.post("/register", authCtl.register);
router.post("/grant/facebook", authCtl.grantFacebook);
router.post("/password/send-mail", authCtl.sendLinkResetPassword);
router.post("/password/reset", authCtl.resetPassword);
router.get("/verify/re-send", verifyAuth, authCtl.sendLinkVerify);
router.get("/verify", authCtl.verifyAccount);
router.get("/profile", verifyAuth, authCtl.getProfile);
router.put("/profile/password", verifyAuth, authCtl.updatePassword);
router.put(
  "/profile",
  verifyAuth,
  upload.single("avatar"),
  authCtl.updateProfile
);
router.post("/create-ai", upload.single("avatar"), authCtl.createYourAi);
router.get("/credit", verifyAuth, authCtl.getCredit);

module.exports = router;
