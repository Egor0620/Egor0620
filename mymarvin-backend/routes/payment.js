const router = require("express").Router();
const paymentCtl = require("../controllers/payment");
const verifyAuth = require("../middleware/auth");

router.post("/setup-project", verifyAuth, paymentCtl.setupProject);
router.post("/create-intent", verifyAuth, paymentCtl.createIntent);
router.post("/create-payment-intent", paymentCtl.createPaymentIntent);
router.post("/session", verifyAuth, paymentCtl.createSessionPayment);
router.post("/payment-link", verifyAuth, paymentCtl.createPaymentLink);
router.post("/check-payment", verifyAuth, paymentCtl.checkPayment);
router.post("/cancel", verifyAuth, paymentCtl.cancelSubscription);

module.exports = router;
