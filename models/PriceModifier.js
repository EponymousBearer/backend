import mongoose from "mongoose";

const PriceModifierSchema = new mongoose.Schema({
  productSlug: { type: String, required: true }, // e.g., "iphone-14-pro-max"
  priceModifiers: [
    {
      category: { type: String, required: true }, // e.g., "Storage"
      condition: { type: String, required: true }, // e.g., "128GB"
      modifier: { type: Number, required: true }, // e.g., +20, -50
    },
  ],
});

export default mongoose.model("PriceModifier", PriceModifierSchema);
