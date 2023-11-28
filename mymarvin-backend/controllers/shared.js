const Tag = require("../models/Tag");
const Saved = require("../models/Saved");
const Message = require("../models/Message");

const createShared = async (req, res) => {
  try {
    const { id, type } = req.body;
    const { use } = req.user;
    if (type == "saved") {
      const update = await Saved.findOneAndUpdate(
        { _id: id },
        { $set: { shared: true } }
      );
      if (update) {
        res.status(200).json(update);
      }
    } else if (type == "message") {
      const update = await Message.findOneAndUpdate(
        { _id: id },
        { $set: { shared: true } }
      );
      if (update) {
        res.status(200).json(update);
      }
    }
    //const defaultTagLabel = type === "text" ? "chat" : type;
    //const defaultTag = await Tag.find({
    //    isPrivate: false,
    //    label: defaultTagLabel,
    //})
    //    .sort("createdAt")
    //    .exec();
    //console.log(defaultTagLabel);
    //tags.push(defaultTag[0]._id.toString());
    //const saved = new Shared({
    //    roomId,
    //    type,
    //    prompt,
    //    value,
    //    tags,
    //    user: use._id,
    //});

    //await saved.save();
    //res.status(201).json(saved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create saved failed",
    });
  }
};

module.exports = {
  createShared,
};
