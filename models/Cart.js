import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    store_location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locations",
      required: true,
    },
    items: [
      {
        product_name: { type: String, required: true },
        product_slug: { type: String, required: true },
        options_selected: { type: [String], default: [] }, // e.g., "256GB", "Like New"
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    total_price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.pre("save", function (next) {
  this.total_price = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

export default mongoose.model("Cart", CartSchema);
