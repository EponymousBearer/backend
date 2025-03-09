import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category_slugs: [{ type: String, required: true }], // Change from single string to array
  image_url: { type: String, required: true },
});

const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;
