const Tag = require("../models/Tag");
const Saved = require("../models/Saved");

const createSaved = async (req, res) => {
  try {
    const { roomId, type, prompt, value, tags } = req.body;
    const { use } = req.user;

    const defaultTagLabel = type === "text" ? "chat" : type;
    const defaultTag = await Tag.find({
      isPrivate: false,
      label: defaultTagLabel,
    })
      .sort("createdAt")
      .exec();
    console.log("defaultTag: ", defaultTag);
    console.log(defaultTagLabel);
    if (defaultTag.length > 0) {
      tags.push(defaultTag[0]._id.toString());
    }
    const saved = new Saved({
      roomId,
      type,
      prompt,
      value,
      tags,
      user: use._id,
    });

    await saved.save();
    res.status(201).json(saved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create saved failed",
    });
  }
};

const getSavedDetail = async (req, res) => {
  try {
    const { savedId } = req.params;
    const saved = await Saved.findById(savedId)
      .populate("user", "-password")
      .populate("tags")
      .populate("roomId")
      .exec();
    res.status(200).json(saved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get saved detail failed",
    });
  }
};

const getAllSaved = async (req, res) => {
  try {
    const { use } = req.user;

    const mySaved = await Saved.find({
      user: use._id,
    })
      .sort("-createdAt")
      .exec();
    res.status(200).json(mySaved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all saved failed",
    });
  }
};

const getSavedByFilter = async (req, res) => {
  try {
    const { use } = req.user;
    const { tag } = req.body;
    const tagExist = await Tag.find({
      value: tag,
    });
    console.log(tag, tagExist);

    const mySaved = await Saved.find({
      user: use._id,
      tags: { $in: tagExist[0]._id },
    })
      .sort("-createdAt")
      .exec();
    res.status(200).json(mySaved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all saved failed",
    });
  }
};

const getSavedByPage = async (req, res) => {
  try {
    const { use } = req.user;
    const { pageNum } = req.body;
    const limit = 10;

    const mySaved = await Saved.find({
      user: use._id,
    })
      .sort("-createdAt")
      .skip(limit * (pageNum - 1))
      .limit(limit * pageNum);
    res.status(200).json(mySaved);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get all saved failed",
    });
  }
};

module.exports = {
  getAllSaved,
  createSaved,
  getSavedDetail,
  getSavedByFilter,
  getSavedByPage,
};
