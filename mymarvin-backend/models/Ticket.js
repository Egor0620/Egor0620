const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    type: { type: String }, // purchase, subscription
    role: { type: String, default: 'service' }, // service, register, account
    price: { type: Number },
    price_id: { type: String },
    product_id: { type: String },
    credits: { type: Number },
    plan: { type: Object },
    currency: { type: String, default: "GBP" },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
