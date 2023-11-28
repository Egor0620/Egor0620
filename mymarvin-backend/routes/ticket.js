const router = require("express").Router();
const ticketCtl = require("../controllers/ticket");
// const verifyAuth = require("../middleware/auth");

router.get("/", ticketCtl.getAllTickets);
router.get("/plans/verify", ticketCtl.getVerifyPlan);
router.get("/plans/account", ticketCtl.getAccountPlans);
router.post("/create", ticketCtl.createTicket);
router.post("/create-all", ticketCtl.createTickets);

module.exports = router;
