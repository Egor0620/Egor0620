const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facebookFeedsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    isPublished: { type: Boolean, default: false },
    postId: { type: String },
    pageId: { type: String },
    namePage: { type: String },
    picturePage: { type: String },
    link: { type: String },
    images: [
      { type: String, }
    ],
    video:
      { type: String, }
    ,
    scheduleAt: { type: Date },
    isFavorite: { type: Boolean, default: false },
    tone: { type: String },
    type: { type: String },
    visual: { type: String },
  },
  {
    timestamps: true,
  },
);

const facebookFeeds = mongoose.model("FacebookFeeds", facebookFeedsSchema);

module.exports = facebookFeeds;
