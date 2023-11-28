const router = require("express").Router();
const aiCtl = require("../controllers/ai");
const verifyAuth = require("../middleware/auth");

router.get("/rooms", verifyAuth, aiCtl.getRooms);
router.post("/rooms/create", verifyAuth, aiCtl.createRoom);
router.get("/rooms/general", verifyAuth, aiCtl.getGeneralRooms);
router.get("/rooms/:roomId", verifyAuth, aiCtl.getMessagesOfRoom);
router.put("/rooms/:roomId", verifyAuth, aiCtl.updateTitleOfRoom);
router.delete("/rooms/:roomId", verifyAuth, aiCtl.deleteRoom);
router.post("/create-message", verifyAuth, aiCtl.createMessage);
router.post("/get-message", aiCtl.getMessage);
router.get("/messages/:id", aiCtl.getMessageDetail);
router.get("/response", verifyAuth, aiCtl.getResponse);
router.post("/create-poem", verifyAuth, aiCtl.createPoem);
router.post("/create-images", verifyAuth, aiCtl.createImages);
router.post("/create-recommendation", verifyAuth, aiCtl.createRecommendation);

module.exports = router;
