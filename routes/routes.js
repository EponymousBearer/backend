import express from "express";
import {
  getBrandBySlug,
  getCategories,
  getProductByBrandCategory,
  getConditions,
  getPriceModifier,
  getProductBySlug,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/Controller.js";

const router = express.Router();

router.get("/allcategories", getCategories);
// router.get("/allbrands", getBrands);
router.get("/brands/:slug", getBrandBySlug);

router.get("/catalog/:categorySlug/:brandSlug", getProductByBrandCategory);

router.get("/product/:slug", getProductBySlug);

router.get("/conditions/:productSlug", getConditions);

router.get("/priceModifiers/:productSlug", getPriceModifier);

router.post("/order", createOrder); // Create order
// {
//   "cart_id": "67d7d02f6da7296009135b91",
//   "user_id": "67b6c518ce468cd40298a61e",
//   "contact": {
//     "name": "John Doe",
//     "email": "johndoe@example.com",
//     "contact_number": "1234567890"
//   },
//   "payout": {
//     "payout_name": "Bank Transfer",
//     "fields": [
//       {
//         "fieldName": "Account Number",
//         "data": "123456789"
//       },
//       {
//         "fieldName": "Bank Name",
//         "data": "XYZ Bank"
//       }
//     ]
//   },
//   "offer_id": "60a7b2b5f36d28433c1d2b6e",
//   "location_id": "67d7baafe90208ffa29686d4"
// }

router.get("/order/:id", getOrderById); // Get order by ID

router.put("/order/:id", updateOrder); // Update order

router.delete("/order/:id", deleteOrder); // Delete order

export default router;
