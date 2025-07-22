const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const dotEnv = require("dotenv");
dotEnv.config();

const UserSchema = new Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "driver"]
    },
    emailOtp: {
      type: String,
      default: "",
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    jwToken: {
      type: String,
    },
    phone: {
      type: String,
      index: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    logoutCount: {
      type: Number,
      default: 0,
    },
    loggedOut: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// enable indexing
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  try {
    const user = this;
    // Only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) {
      return next();
    }
    let saltRounds = parseInt(process.env.SALT_ROUNDS);
    let salt = await bcrypt.genSalt(saltRounds);
    let hashedPassword = user.password
      ? await bcrypt.hash(user.password, salt)
      : null;
    user.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

const user = mongoose.model("user", UserSchema);

module.exports = user;
