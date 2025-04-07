import mongoose from "mongoose";

const payoutMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // PayPal, Credit Card, etc.
  fields: [
    {
      fieldName: { type: String, required: true }, // cardNumber, paypalEmail
      fieldType: { type: String, required: true }, // text, number, email
    },
  ],
  price_increase: { type: Number, default: 0 }, // Optional increase in price for this method
  icon_url: { type: String, required: true }, // URL for method icon
});

export default mongoose.model("PayoutMethod", payoutMethodSchema);
