const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    title: { type: String },
    type: { type: String, default: "text" },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isGeneral: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
