const mongoose = require("mongoose");
const { Schema } = mongoose;
// mongoose object id
const ObjectId = Schema.Types.ObjectId;

const BookingSchema = new Schema(
  {
    customer: {
      type: ObjectId,
      ref: "user"
    },
    driver: {
      type: ObjectId,
      ref: "user",
      default: null, // Assigned later
    },
    from: {
      type: ObjectId,
      ref: "area",
    },
    to: {
      type: ObjectId,
      ref: "area",
    },
    pickupTime: {
      type: Date
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "on-the-way",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const booking = mongoose.model("Booking", BookingSchema);
module.exports = booking;
