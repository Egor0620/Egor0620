const mongoose = require("mongoose");

const openAiSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: { type: String },
    payload: { type: String },
    asked: { type: String },
    data: { type: Object },
  },
  {
    timestamps: true,
  }
);

const OpenAi = mongoose.model("OpenAi", openAiSchema);

module.exports = OpenAi;
