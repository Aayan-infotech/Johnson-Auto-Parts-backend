import { Request, Response } from "express";
import Product from "../../models/ProductModel";
import Category from "../../models/Category";
import Subcategory from "../../models/Subcategory";
import SubSubcategory from "../../models/SubSubcategory";
import Review from "../../models/RatingAndReviews";
import Order from "../../models/OrderModel";
import { translateText } from "../../utills/translateService";
import mongoose from "mongoose";
interface AuthRequest extends Request {
  user?: { userId: string; email: string };
  fileLocations?: string[]; // Adjust the type as needed
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      subcategoryId,
      subsubcategoryId,
      name,
      description,
      price,
      partNo,
      brand,
      quantity,
      isActive,
      autoPartType,
      regularServiceCategory,
      compatibleVehicles, //array of { make, models: [{ model, years: [] }] }
    } = req.body;
    console.log(req.fileLocations);
    const productImages = req.fileLocations || [];
    const vehicles = JSON.parse(compatibleVehicles);
    if (!name || !description || !brand) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId. Category does not exist.",
        });
      }
    }

    if (subcategoryId) {
      const subcategoryExists = await Subcategory.findById(subcategoryId);
      if (!subcategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategoryId. Subcategory does not exist.",
        });
      }
    }

    if (subsubcategoryId) {
      const subsubcategoryExists = await SubSubcategory.findById(
        subsubcategoryId
      );
      if (!subsubcategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid subsubcategoryId. Sub-subcategory does not exist.",
        });
      }
    }

    // Translate text fields to French
    const nameFr = await translateText(name, "fr");
    const descriptionFr = await translateText(description, "fr");
    const brandFr = await translateText(brand, "fr");

    const product = new Product({
      Category: categoryId || null,
      SubCategory: subcategoryId || null,
      SubSubcategory: subsubcategoryId || null,
      name: { en: name, fr: nameFr },
      description: { en: description, fr: descriptionFr },
      price: {
        actualPrice: price.actualPrice,
        discountPercent: price.discountPercent ?? 0,
      },
      partNo: partNo || null,
      regularServiceCategory,
      brand: { en: brand, fr: brandFr },
      picture: productImages,
      quantity: quantity ?? 0,
      isActive: isActive ?? true,
      autoPartType: autoPartType || "",
      compatibleVehicles: vehicles ?? [], // ✅ Store directly
      salesCount: 0,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: (error as Error).message,
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: "en" | "fr" };

    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .populate("Category", "name")
      .lean();

    // Fetch all reviews in one query to optimize performance
    const productIds = products.map((product) => product._id);
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Convert reviews array into a map for quick lookup
    const ratingMap = new Map(
      reviews.map((r) => [r._id.toString(), r.avgRating.toFixed(1)])
    );

    // Process products
    const updatedProducts = products.map((product) => {
      const actualPrice: number = product?.price?.actualPrice || 0;
      const discountPercent: number = product?.price?.discountPercent || 0;
      const discountedPrice: number =
        actualPrice - (actualPrice * discountPercent) / 100;
      const averageRating = ratingMap.get(product._id.toString()) || "0.0"; // Default 0 if no rating

      return {
        ...product,
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        averageRating, // Include average rating
      };
    });

    return res.status(200).json({
      success: true,
      message: "Products Fetched Successfully",
      products: updatedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: (error as Error).message,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: "en" | "fr" };

    const product = await Product.findById(req.params.id)
      .populate("Category", "name") // Populate Category
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const actualPrice = product.price?.actualPrice || 0;
    const discountPercent = product.price?.discountPercent || 0;
    const discountedPrice = actualPrice - (actualPrice * discountPercent) / 100;

    // Calculate average rating
    const reviews = await Review.find({ productId: product._id }).lean();
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = totalRating / reviews.length;
    }

    // Fetch similar products
    let similarProducts: any[] = [];
    if (product.autoPartType) {
      similarProducts = await Product.find({
        autoPartType: product.autoPartType,
        _id: { $ne: product._id },
      }).lean();
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: {
        ...product,
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        averageRating: averageRating.toFixed(1), // Include average rating
      },
      similarProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: (error as Error).message,
    });
  }
};

export const getProductBySubCategoryOrSubSubCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { lang } = req.query as { lang?: "en" | "fr" };

    const subsubcategoryExist = await SubSubcategory.findById(id);
    const subcategoryExist = await Subcategory.findById(id);

    let productsData = [];

    if (subsubcategoryExist) {
      productsData = await Product.find({ SubSubcategory: id })
        .populate("Category", "name")
        .lean();
    } else if (subcategoryExist) {
      productsData = await Product.find({ SubCategory: id })
        .populate("Category", "name")
        .lean();
    } else {
      return res.status(404).json({
        success: false,
        message:
          "Invalid ID. Please provide a valid SubCategoryId or SubSubCategoryId",
      });
    }

    // Fetch all product IDs
    const productIds = productsData.map((product) => product._id);

    // Fetch average ratings for these products
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Convert to a map for fast lookup
    const ratingMap = new Map(
      reviews.map((r) => [r._id.toString(), r.avgRating.toFixed(1)])
    );

    // Process products with rating
    const updatedProductsData = productsData.map((product) => {
      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice =
        actualPrice - (actualPrice * discountPercent) / 100;
      const averageRating = ratingMap.get(product._id.toString()) || "0.0"; // Default 0 if no rating

      return {
        ...product,
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        averageRating, // Include average rating
      };
    });

    return res.status(200).json({
      success: true,
      message: `Products fetched successfully for ID ${id}`,
      productsData: updatedProductsData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: (error as Error).message,
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      price,
      discount,
      stock,
      category,
      subCategory,
      subSubCategory,
      brand,
      isActive,
      partNo,
      type,
      compatibleVehicles,
      removedImages,
    } = req.body;
    const latestImgs=JSON.parse(removedImages)
    const productImages = req.fileLocations || [];

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // --- Validate Categories ---
    const isValidId = (id: string) => mongoose.isValidObjectId(id);
    const getValidCategory = async (id: string | null) =>
      id && id !== "N/A" && isValidId(id) && await Category.findById(id) ? id : null;
    const getValidSubcategory = async (id: string | null) =>
      id && id !== "N/A" && isValidId(id) && await Subcategory.findById(id) ? id : null;
    const getValidSubSubcategory = async (id: string | null) =>
      id && id !== "N/A" && isValidId(id) && await SubSubcategory.findById(id) ? id : null;

    const validCategory = await getValidCategory(category);
    const validSubCategory = await getValidSubcategory(subCategory);
    const validSubSubCategory = await getValidSubSubcategory(subSubCategory);

    // --- Translations ---
    const updatedName = name ? { en: name, fr: await translateText(name, "fr") } : existingProduct.name;
    const updatedDescription = description ? { en: description, fr: await translateText(description, "fr") } : existingProduct.description;
    const updatedBrand = brand ? { en: brand, fr: await translateText(brand, "fr") } : existingProduct.brand;

    // --- Compatible Vehicles ---
    let updatedCompatibleVehicles = existingProduct.compatibleVehicles;
    if (compatibleVehicles) {
      try {
        updatedCompatibleVehicles =
          typeof compatibleVehicles === "string" ? JSON.parse(compatibleVehicles) : compatibleVehicles;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid format for compatibleVehicles." });
      }
    }

    // --- Price ---
    const updatedPrice = {
      actualPrice: price ?? existingProduct.price.actualPrice,
      discountPercent: discount ?? existingProduct.price.discountPercent,
    };

    // --- Image Update Logic ---
    let updatedImages = existingProduct.picture || [];

    if (latestImgs && Array.isArray(latestImgs)) {
      const removeSet = new Set(latestImgs); // exact match
      updatedImages = updatedImages.filter((imgUrl) => !removeSet.has(imgUrl));
    }

    if (productImages.length > 0) {
      updatedImages = [...updatedImages, ...productImages];
    }

    // --- Final Update Data ---
    const updateData = {
      name: updatedName,
      description: updatedDescription,
      brand: updatedBrand,
      price: updatedPrice,
      quantity: stock ?? existingProduct.quantity,
      Category: validCategory,
      SubCategory: validSubCategory,
      SubSubcategory: validSubSubCategory,
      picture: updatedImages,
      isActive: isActive ?? existingProduct.isActive,
      autoPartType: type ?? existingProduct.autoPartType,
      partNo: partNo ?? existingProduct.partNo,
      compatibleVehicles: updatedCompatibleVehicles,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: (error as Error).message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Error deleting product", error });
  }
};
// products by autopart type
export const getProductByautoPartType = async (req: Request, res: Response) => {
  try {
    const { type, lang } = req.query as { type?: string; lang?: "en" | "fr" };

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is a required parameter.",
      });
    }

    const products = await Product.find({ autoPartType: type })
      .populate("Category", "name")
      .lean();

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this auto part type.",
      });
    }

    // Fetch all product IDs
    const productIds = products.map((product) => product._id);

    // Fetch average ratings for these products
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Convert to a map for quick lookup
    const ratingMap = new Map(
      reviews.map((r) => [r._id.toString(), r.avgRating.toFixed(1)])
    );

    // Process products with average rating
    const updatedProducts = products.map((product) => {
      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice =
        actualPrice - (actualPrice * discountPercent) / 100;
      const averageRating = ratingMap.get(product._id.toString()) || "0.0"; // Default 0 if no rating

      return {
        ...product,
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        averageRating, // Include average rating
      };
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: updatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: (error as Error).message,
    });
  }
};
// home page api  for *top*/*selling lighting* *replacement* and *performance* type
export const getFilteredProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { filter, lang } = req.query as {
      filter?: string;
      lang?: "en" | "fr";
    };

    if (!filter) {
      return res.status(400).json({
        success: false,
        message: "Filter is a required parameter.",
      });
    }

    let products = [];

    if (filter === "Top Selling") {
      const mostSoldProducts = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]);

      const productIds = mostSoldProducts.map((p) => p._id);
      products = await Product.find({ _id: { $in: productIds } })
        .populate("Category", "name")
        .lean();
    } else if (filter === "Replacement Parts") {
      // Return products with valid regularServiceCategory
      products = await Product.find({
        regularServiceCategory: { $ne: null },
      })
        .populate("Category", "name")
        .lean();
    } else {
      // Keyword based filters
      const filterMap: Record<string, string[]> = {
        Lighting: [
          "light",
          "lights",
          "indicator",
          "headlamp",
          "headlamps",
          "indicators",
        ],
        Performance: ["exhaust", "turbo", "tuning", "engine"],
      };

      if (!filterMap[filter]) {
        return res.status(400).json({
          success: false,
          message: "Invalid filter option.",
        });
      }

      const keywords = filterMap[filter];
      const filterQuery = {
        autoPartType: {
          $in: keywords.map((type) => new RegExp(`^${type}$`, "i")),
        },
      };

      products = await Product.find(filterQuery)
        .populate("Category", "name")
        .lean();
    }

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this filter.",
      });
    }

    const updatedProducts = products.map((product) => {
      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice =
        actualPrice - (actualPrice * discountPercent) / 100;

      return {
        ...product,
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      };
    });

    res.status(200).json({
      success: true,
      message: "Filtered products fetched successfully",
      length: updatedProducts.length,
      products: updatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filtered products",
      error: (error as Error).message,
    });
  }
};

export const getYears = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}, "compatibleVehicles");

    const yearSet = new Set<number>();

    products.forEach((product) => {
      product.compatibleVehicles.forEach((cv) => {
        cv.models.forEach((model) => {
          model.years.forEach((year) => {
            yearSet.add(year);
          });
        });
      });
    });

    const years = Array.from(yearSet).sort((a, b) => a - b); // Optional: sort by year
    res.status(200).json({ success: true, years });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching years",
      error: (error as Error).message,
    });
  }
};

export const getMakesByYear = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year);
    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "Year is required" });
    }

    const products = await Product.find(
      { "compatibleVehicles.models.years": year },
      "compatibleVehicles"
    );

    const makeSet = new Set<string>();

    products.forEach((product) => {
      product.compatibleVehicles.forEach((cv) => {
        const relevantModel = cv.models.some((model) =>
          model.years.includes(year)
        );
        if (relevantModel) {
          makeSet.add(cv.make);
        }
      });
    });

    const makes = Array.from(makeSet).sort();
    res.status(200).json({ success: true, makes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching makes",
      error: (error as Error).message,
    });
  }
};

export const getModelsByYearAndMake = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year);
    const make = req.query.make?.toString();

    if (!year || !make) {
      return res.status(400).json({
        success: false,
        message: "Year and make are required",
      });
    }

    const makeRegex = new RegExp(`^${make}$`, "i"); // Case-insensitive exact match

    const products = await Product.find(
      {
        "compatibleVehicles.make": makeRegex,
        "compatibleVehicles.models.years": year,
      },
      "compatibleVehicles"
    );

    const modelSet = new Set<string>();

    products.forEach((product) => {
      product.compatibleVehicles.forEach((cv) => {
        if (cv.make.toLowerCase() === make.toLowerCase()) {
          cv.models.forEach((m) => {
            if (m.years.includes(year)) {
              modelSet.add(m.model);
            }
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      models: Array.from(modelSet).sort(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching models",
      error: (error as Error).message,
    });
  }
};

export const getProductsByYearMakeModel = async (
  req: Request,
  res: Response
) => {
  try {
    const year = Number(req.query.year);
    const make = req.query.make?.toString().trim();
    const model = req.query.model?.toString().trim();

    if (!year || !make || !model) {
      return res.status(400).json({
        success: false,
        message: "Year, make, and model are required",
      });
    }

    // Build case-insensitive regex patterns for make and model
    const makeRegex = new RegExp(`^${make}$`, "i");
    const modelRegex = new RegExp(`^${model}$`, "i");

    // Use aggregation to unwind and match nested arrays
    const products = await Product.aggregate([
      // Unwind compatibleVehicles array
      { $unwind: "$compatibleVehicles" },
      // Unwind the models array inside each compatibleVehicles object
      { $unwind: "$compatibleVehicles.models" },
      // Match documents with the correct make, model, and year within the same nested object
      {
        $match: {
          "compatibleVehicles.make": makeRegex,
          "compatibleVehicles.models.model": modelRegex,
          "compatibleVehicles.models.years": year,
        },
      },
      // Group back by product _id and reassemble the full document
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);
    if (products.length <= 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this model",
      });
    } else {
      return res.status(200).json({
        success: true,
        length: products.length,
        products,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: (error as Error).message,
    });
  }
};

// popular productss
export const getMostSoldProducts = async (req: Request, res: Response) => {
  try {
    const mostSold = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // You can adjust this number
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product: 1,
          totalSold: 1,
        },
      },
    ]);

    res.status(200).json(mostSold);
  } catch (error) {
    console.error("Error fetching most sold products:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching most sold products" });
  }
};

export const searchProductsforService = async (req: Request, res: Response) => {
  try {
    const id = req.params.serviceId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const products = await Product.find({ regularServiceCategory: id });
    if (products.length == 0) {
      return res
        .status(404)
        .json({ message: "No Products found for the Selected Service Type" });
    }
    res.status(200).json({ message: "Products Fetched", products });
  } catch (error) {
    console.error("Product search error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const productsOfModel = async (req: Request, res: Response) => {
  const { modelName, lang } = req.query;

  try {
    if (!modelName || typeof modelName !== "string") {
      return res
        .status(400)
        .json({ error: "modelName query parameter is required" });
    }

    // Restrict to "en" or "fr", default to "en"
    const language =
      typeof lang === "string" && (lang === "en" || lang === "fr")
        ? lang
        : "en";

    const products = await Product.find({
      compatibleVehicles: {
        $elemMatch: {
          models: {
            $elemMatch: {
              model: { $regex: new RegExp(modelName, "i") }, // case-insensitive match
            },
          },
        },
      },
    });

    const localizedProducts = products.map((product) => {
      const nameObj = product.name as Record<string, string>;
      const descObj = product.description as Record<string, string>;

      return {
        ...product.toObject(),
        name: nameObj[language] || nameObj["en"],
        description: descObj[language] || descObj["en"],
      };
    });

    res.status(200).json({
      success: true,
      message: "Product of Model Fetched Successfully",
      products: localizedProducts,
    });
  } catch (error) {
    console.error("Error fetching products by model:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const regex = new RegExp(query, "i"); // case-insensitive partial match

    const products = await Product.find({
      $or: [
        { "name.en": regex },
        { "name.fr": regex },
        { "description.en": regex },
        { "description.fr": regex },
        { "compatibleVehicles.models.model": regex },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
