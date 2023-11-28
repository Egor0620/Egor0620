const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: { type: String },
    amount: { type: Number },
    session: { type: Object },
  },
  {
    timestamps: true,
  }
);

const Transactions = mongoose.model("Transactions", transactionSchema);

module.exports = Transactions;
