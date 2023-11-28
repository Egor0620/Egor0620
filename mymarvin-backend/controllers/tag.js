const Tag = require("../models/Tag");

const createTag = async (req, res) => {
  try {
    const { use } = req.user;
    const { value, label, isPrivate } = req.body;
    const tag = new Tag({
      value,
      label,
      user: use._id,
      isPrivate: isPrivate === undefined ? true : isPrivate,
    });
    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create default tags failed",
    });
  }
};

const getTags = async (req, res) => {
  try {
    const { use } = req.user;
    // const defaultTags = await Tag.find({ isPrivate: false }).sort("createdAt").exec();
    // const tags = await Tag.find({ user: use._id, isPrivate: true }).sort("-label").exec();
    // const results = defaultTags.concat(tags);
    // res.status(200).json(results);

    const tags = await Tag.find({ user: use._id, isPrivate: true })
      .sort("-label")
      .exec();
    res.status(200).json(tags);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create payment intent failed",
    });
  }
};

const getAllTags = async (req, res) => {
  try {
    const { use } = req.user;

    const tags = await Tag.find({ user: use._id }).sort("-label").exec();
    res.status(200).json(tags);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Create payment intent failed",
    });
  }
};

module.exports = {
  createTag,
  getAllTags,
  getTags,
};
