import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact_number: { type: String, required: true },
  },
  payout: {
    payout_name: { type: String, required: true },
    fields: [
      {
        fieldName: { type: String, required: true },
        data: { type: String, required: true },
      },
    ],
  },
  date: { type: Date, default: Date.now },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "locations",
    required: true,
  },
});

export default mongoose.model("Order", OrderSchema);
