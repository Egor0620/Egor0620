const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    label: { type: String },
    value: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    isPrivate: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
