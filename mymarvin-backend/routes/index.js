const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const userRouter = require("./users");
const aiRouter = require("./ai");
const ticketRouter = require("./ticket");
const paymentRouter = require("./payment");
const tagRouter = require("./tag");
const savedRouter = require("./saved");
const sharedRouter = require("./shared");
const facebookRouter = require("./facebook");
const constantRouter = require("./constant");

router.use(userRouter);
router.use(authRouter);
router.use("/ai", aiRouter);
router.use("/tickets", ticketRouter);
router.use("/payments", paymentRouter);
router.use("/tags", tagRouter);
router.use("/saved", savedRouter);
router.use("/share", sharedRouter);
router.use("/facebook", facebookRouter);
router.use(constantRouter);

module.exports = router;
