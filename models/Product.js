import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    brandSlug: { type: String, required: true },
    categorySlug: { type: String, required: true },
    basePrice: { type: Number, required: true },
    options: [
      {
        category: { type: String, required: true },
        question: { type: String, required: true },
        answers: [{ type: String, required: true }],
        terms: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
