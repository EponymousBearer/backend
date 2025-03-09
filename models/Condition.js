import mongoose from "mongoose";

const ConditionSchema = new mongoose.Schema({
  productSlug: { type: String, required: true }, // Slug of the product (e.g., iphone-14-pro-max)
  conditions: [
    {
      name: { type: String, required: true }, // e.g., "New", "Used", "Refurbished"
      guideline: { type: String }, // e.g., "Brand New in a SEALED Box"
      terms: [{ type: String }], // Array of terms like ["No scratches", "Fully functional"]
    },
  ],
});

export default mongoose.model("Condition", ConditionSchema);
