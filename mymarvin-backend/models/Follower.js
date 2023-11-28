const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    followed: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Follower = mongoose.model("Follower", followerSchema);

module.exports = Follower;
