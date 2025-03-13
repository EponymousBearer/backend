import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Condition from "../models/Condition.js";
import PriceModifier from "../models/PriceModifier.js";
import dotenv from "dotenv";

dotenv.config();

//category
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//brand
export const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Get category slug from query params
    console.log("Requested category slug:", slug);
    if (!slug) {
      return res.status(400).json({ message: "Category slug is required" });
    }

    const brands = await Brand.find({ category_slugs: { $in: [slug] } });

    // const brands = await Brand.find({ category_slugs: { $in: [slug] } });
    // console.log("Found brands:", brands);

    if (!Array.isArray(brands)) {
      return res.status(200).json({ brands: [] }); // ✅ Always return an array
    }

    if (brands.length === 0) {
      return res
        .status(404)
        .json({ message: "No brands found for this category" });
    }
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductByBrandCategory = async (req, res) => {
  try {
    const { categorySlug, brandSlug } = req.params;
    const product = await Product.find({
      categorySlug: categorySlug,
      brandSlug: brandSlug,
    });
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ status_code: 500, message: "Internal Server Error" });
  }
};

// get product with price modifier and conditions
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("Fetching product with slug:", slug);

    // Fetch product details
    const product = await Product.findOne({ slug });
    if (!product) {
      console.log("Product not found:", slug);
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch price modifiers and conditions using productSlug
    const priceModifiers = (await PriceModifier.findOne({
      productSlug: slug,
    })) || { priceModifiers: [] };
    const conditions = (await Condition.findOne({ productSlug: slug })) || {
      conditions: [],
    };

    // console.log("Fetched Product:", product);
    // console.log("Fetched Price Modifiers:", priceModifiers);
    // console.log("Fetched Conditions:", conditions);

    // Return structured response
    res.json({ product, priceModifiers, conditions });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getConditions = async (req, res) => {
  const { productSlug } = req.params;
  console.log("Received productSlug:", productSlug);

  try {
    const condition = await Condition.findOne({
      productSlug: String(productSlug),
    });
    // const condition = await Condition.find();
    console.log("Condition fetched from DB:", condition);

    if (!condition) {
      console.log("Condition not found in database");
      return res.status(404).json({ message: "Condition not found" });
    }

    res.json(condition);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Error fetching condition", error });
  }
};

export const getPriceModifier = async (req, res) => {
  try {
    const { productSlug } = req.params;
    const priceModifiers = await PriceModifier.findOne({
      productSlug: String(productSlug),
    });

    if (!priceModifiers) {
      return res
        .status(404)
        .json({ error: "No price modifiers found for this product" });
    }

    res.status(200).json(priceModifiers);
  } catch (err) {
    console.error("Error fetching price modifiers:", err);
    res.status(500).json({ error: "Failed to retrieve price modifiers" });
  }
};
