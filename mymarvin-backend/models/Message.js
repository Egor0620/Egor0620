const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        prompt: {
            type: String,
        },
        response: {
            type: Object,
        },
        image: {
            type: Object,
        },
        type: {
            type: String,
            default: "text",
        },
        shared: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
