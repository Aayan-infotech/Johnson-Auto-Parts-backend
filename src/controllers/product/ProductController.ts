import { Request, Response } from "express";
import Product from "../../models/ProductModel";
import RatingAndReviews from "../../models/RatingAndReviews";
import Category from "../../models/Category";
import Subcategory from "../../models/Subcategory";
import SubSubcategory from "../../models/SubSubcategory";
import { translateText } from "../../utills/translateService";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      subcategoryId,
      subsubcategoryId,
      name,
      description,
      price,
      brand,
      picture,
      quantity,
      isActive,
    } = req.body;

    if (!categoryId || !name || !description || !price || !brand) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate Category
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid categoryId. Category does not exist." });
    }

    // Validate Subcategory (if provided)
    if (subcategoryId) {
      const subcategoryExists = await Subcategory.findById(subcategoryId);
      if (!subcategoryExists) {
        return res.status(400).json({ message: "Invalid subcategoryId. Subcategory does not exist." });
      }
    }

    if (subsubcategoryId) {
      const subsubcategoryExists = await SubSubcategory.findById(subsubcategoryId);
      if (!subsubcategoryExists) {
        return res.status(400).json({ message: "Invalid subsubcategoryId. Sub-subcategory does not exist." });
      }
    }

    const nameFr = await translateText(name, "fr");
    const descriptionFr = await translateText(description, "fr");
    const brandFr = await translateText(brand, "fr");

    const product = new Product({
      Category: categoryId,
      SubCategory: subcategoryId || "N/A",
      SubSubcategory: subsubcategoryId || "N/A",
      name: { en: name, fr: nameFr },
      description: { en: description, fr: descriptionFr },
      price: {
        actualPrice: price.actualPrice,
        discountPercent: price.discountPercent ?? 0,
      },
      brand: { en: brand, fr: brandFr },
      picture,
      quantity: quantity ?? 0,
      isActive: isActive ?? true,
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating product", error: (error as Error).message });
  }
};


export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().lean();

    // Add discounted price calculation
    const updatedProducts = products.map((product) => {
      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice =
        actualPrice - (actualPrice * discountPercent) / 100;

      return {
        ...product,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)), // Round to 2 decimal places
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
    const product = await Product.findById(req.params.id)
      .lean()
      .populate("Category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const actualPrice = product.price?.actualPrice || 0;
    const discountPercent = product.price?.discountPercent || 0;

    const discountedPrice = actualPrice - (actualPrice * discountPercent) / 100;

    const reviews = await RatingAndReviews.find({ productId: product });
    console.log(reviews);
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: {
        ...product,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        reviews,
      },
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
    const id = req.params.id;

    const subsubcategoryExist = await SubSubcategory.findById(id);
    const subcategoryExist = await Subcategory.findById(id);

    let productsData = [];

    if (subsubcategoryExist) {
      productsData = await Product.find({ SubSubcategory: id }).lean();
    } else if (subcategoryExist) {
      productsData = await Product.find({ SubCategory: id }).lean();
    } else {
      return res.status(404).json({
        success: false,
        message:
          "Invalid ID. Please provide a valid SubCategoryId or SubSubCategoryId",
      });
    }

    const updatedProductsData = productsData.map((product) => {
      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice =
        actualPrice - (actualPrice * discountPercent) / 100;

      return {
        ...product,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)), // Ensure rounded to 2 decimal places
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

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const {
      name,
      price,
      discount,
      quantity,
      categoryId,
      subcategoryId,
      subsubcategoryId,
    } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {
      name: name ?? existingProduct.name,
      price: {
        actualPrice: price ?? existingProduct.price.actualPrice,
        discountPercent: discount ?? existingProduct.price.discountPercent,
      },
      quantity: quantity ?? existingProduct.quantity,
      Category: categoryId ?? existingProduct.Category,
      SubCategory: subcategoryId ?? existingProduct.SubCategory,
      SubSubcategory: subsubcategoryId ?? existingProduct.SubSubcategory,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(404).json({ message: "Error updating product", error });
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
