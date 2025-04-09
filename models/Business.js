import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  email: { type: String, required: true },
  purchaseMethod: { type: String, enum: ["instore", "mailin"], required: true },
  legalBusinessName: { type: String, required: true },
  dba: { type: String },
  country: { type: String, required: true },
  currency: { type: String, required: true },
  address: { type: String, required: true },
  addressDetails: { type: String },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zipCode: { type: String, default: "" }, 
  phone: {
    countryCode: { type: String, default: "" },
    number: { type: String, default: "" },
  },
});

export default mongoose.model("Business", BusinessSchema);
