import express from "express";
import {
  getBrandBySlug,
  getCategories,
  getProductByBrandCategory,
  getConditions,
  getPriceModifier,
} from "../controllers/Controller.js";

const router = express.Router();

router.get("/allcategories", getCategories);
// router.get("/allbrands", getBrands);
router.get("/brands/:slug", getBrandBySlug);

router.get("/catalog/:categorySlug/:brandSlug", getProductByBrandCategory);

router.get("/conditions/:productSlug", getConditions);

router.get("/priceModifiers/:productSlug", getPriceModifier);

export default router;
