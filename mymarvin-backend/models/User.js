const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    ainame: { type: String },
    avatar: {
      type: Object,
    },
    username: { type: String },
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String },
    verify: { type: Boolean, default: false },
    followed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    account_id: { type: String }, // stripe account id
    account_link: { type: Object }, // stripe account link
    customer_id: { type: String }, // stripe customer id
    balance: { type: Number, default: 0 }, // credits
    plan_id: { type: String },
    session_id: { type: String },
    fbAccountId: { type: String },
    fbAccessToken: { type: String },
    feeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FacebookFeeds",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(Number(process.env.SALT_WORK_FACTOR), function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
