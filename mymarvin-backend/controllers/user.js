const User = require("../models/User");

const follower = async (req, res) => {
  try {
    const { use } = req.user;
    const { userId } = req.body;

    const myUser = await User.findById(use._id).exec();
    myUser.followed = [...myUser.followed, userId];
    await myUser.save();

    res.status(200).json({
      message: "Followed!",
    });
  } catch (error) {
    console.log("err: ", error);
    res.status(400).json({
      message: "Follow user failed",
    });
  }
};

const getUserWithUsername = async (req, res) => {
  try {
    const { ainame } = req.params;
    const user = await User.findOne({ ainame }).select("-password").exec();

    res.status(200).json(user);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get user detail failed",
    });
  }
};

module.exports = {
  getUserWithUsername,
  follower,
};
