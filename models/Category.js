import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image_url: { type: String, required: true }
});

export default mongoose.model("Category", CategorySchema);
