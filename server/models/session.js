const mongoose = require("mongoose");
const { Schema } = mongoose;
// mongoose object id
const ObjectId = Schema.Types.ObjectId;

const SessionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
    },
    activities :{
      type: [String],
      default: []
    },
    loginTime: {
      type: Date,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    sessionTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const session = mongoose.model("Session", SessionSchema);

module.exports = session;