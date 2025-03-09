import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand_slug: { type: String, required: true }, // Matches the brand slug
  category_slug: { type: String, required: true }, // For filtering by category
  image_url: { type: String, required: true },
});

// module.exports = mongoose.model("Device", DeviceSchema);
export default mongoose.model("Device", DeviceSchema);
