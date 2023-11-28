const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedSchema = new Schema(
    {
        title: { type: String },
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        user: { type: Schema.Types.ObjectId, ref: "User" },
        roomId: { type: Schema.Types.ObjectId, ref: "Room" },
        response: { type: Object },
        type: { type: String },
        prompt: { type: String },
        value: { type: String },
        shared: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Saved = mongoose.model("Saved", savedSchema);

module.exports = Saved;
