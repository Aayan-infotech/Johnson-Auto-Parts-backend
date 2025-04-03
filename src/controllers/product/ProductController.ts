import { Request, Response } from "express";
import Product from "../../models/ProductModel"
import Category from "../../models/Category";
import Subcategory from "../../models/Subcategory";
import SubSubcategory from "../../models/SubSubcategory";
import { translateText } from "../../utills/translateService";
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
      brand,
      quantity,
      isActive,
      compatibleVehicles, 
    } = req.body;
    
    const productImage = req.fileLocations;

    if (!name || !description || !price?.actualPrice || !brand) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          message: "Invalid categoryId. Category does not exist.",
        });
      }
    }

    if (subcategoryId) {
      const subcategoryExists = await Subcategory.findById(subcategoryId);
      if (!subcategoryExists) {
        return res.status(400).json({
          message: "Invalid subcategoryId. Subcategory does not exist.",
        });
      }
    }

    if (subsubcategoryId) {
      const subsubcategoryExists = await SubSubcategory.findById(subsubcategoryId);
      if (!subsubcategoryExists) {
        return res.status(400).json({
          message: "Invalid subsubcategoryId. Sub-subcategory does not exist.",
        });
      }
    }

    const nameFr = await translateText(name, "fr");
    const descriptionFr = await translateText(description, "fr");
    const brandFr = await translateText(brand, "fr");

    const product = new Product({
      Category: categoryId,
      SubCategory: subcategoryId || null,
      SubSubcategory: subsubcategoryId || null,
      name: { en: name, fr: nameFr },
      description: { en: description, fr: descriptionFr },
      price: {
        actualPrice: price.actualPrice,
        discountPercent: price.discountPercent ?? 0,
      },
      brand: { en: brand, fr: brandFr },
      picture: productImage,
      quantity: quantity ?? 0,
      isActive: isActive ?? true,
      compatibleVehicles: {
        year: compatibleVehicles?.year || [],
        make: compatibleVehicles?.make || [],
        model: compatibleVehicles?.model || [],
      },
      salesCount: 0,
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: (error as Error).message,
    });
  }
};


export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: "en" | "fr" };
    const products = await Product.find({ isActive: true })
      .populate("Category")
      .lean();

    const updatedProducts = products.map((product) => {
      const actualPrice: number = product?.price?.actualPrice || 0;
      const discountPercent: number = product?.price?.discountPercent || 0;
      const discountedPrice: number =
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
      .populate("Category") // Populate Category
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

    // Handle Category population
    const category =
      typeof product.Category === "object" ? product.Category : null;

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
    const { id } = req.params;
    const { lang } = req.query as { lang?: "en" | "fr" };

    const subsubcategoryExist = await SubSubcategory.findById(id);
    const subcategoryExist = await Subcategory.findById(id);

    let productsData = [];

    if (subsubcategoryExist) {
      productsData = await Product.find({ SubSubcategory: id })
        .populate("Category")
        .lean();
    } else if (subcategoryExist) {
      productsData = await Product.find({ SubCategory: id })
        .populate("Category")
        .lean();
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
        name: product?.name?.[lang ?? "en"] ?? product.name.en,
        description:
          product?.description?.[lang ?? "en"] ?? product.description.en,
        brand: product?.brand?.[lang ?? "en"] ?? product.brand.en,

        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
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
      quantity,
      categoryId,
      subcategoryId,
      subsubcategoryId,
      brand,
      isActive,
      compatibleVehicles, 
    } = req.body;
    
    const productImages = req.fileLocations;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (categoryId && !(await Category.findById(categoryId))) {
      return res.status(400).json({ success: false, message: "Invalid categoryId. Category does not exist." });
    }

    if (subcategoryId && !(await Subcategory.findById(subcategoryId))) {
      return res.status(400).json({ success: false, message: "Invalid subcategoryId. Subcategory does not exist." });
    }

    if (subsubcategoryId && !(await SubSubcategory.findById(subsubcategoryId))) {
      return res.status(400).json({ success: false, message: "Invalid subsubcategoryId. Sub-subcategory does not exist." });
    }

    let updatedName = { ...existingProduct.name };
    let updatedDescription = { ...existingProduct.description };
    let updatedBrand = { ...existingProduct.brand };

    if (name) {
      const nameFr = await translateText(name, "fr");
      updatedName = { en: name, fr: nameFr };
    }

    if (description) {
      const descriptionFr = await translateText(description, "fr");
      updatedDescription = { en: description, fr: descriptionFr };
    }

    if (brand) {
      const brandFr = await translateText(brand, "fr");
      updatedBrand = { en: brand, fr: brandFr };
    }

    const updatedPrice = {
      actualPrice: price?.actualPrice ?? existingProduct.price.actualPrice,
      discountPercent: price?.discountPercent ?? existingProduct.price.discountPercent,
    };

    const updatedCompatibleVehicles = compatibleVehicles
      ? {
          year: compatibleVehicles.year || existingProduct.compatibleVehicles.year,
          make: compatibleVehicles.make || existingProduct.compatibleVehicles.make,
          model: compatibleVehicles.model || existingProduct.compatibleVehicles.model,
        }
      : existingProduct.compatibleVehicles;

    const updateData = {
      name: updatedName,
      description: updatedDescription,
      brand: updatedBrand,
      price: updatedPrice,
      quantity: quantity ?? existingProduct.quantity,
      Category: categoryId ?? existingProduct.Category,
      SubCategory: subcategoryId ?? existingProduct.SubCategory,
      SubSubcategory: subsubcategoryId ?? existingProduct.SubSubcategory,
      picture: productImages ?? existingProduct.picture,
      isActive: isActive ?? existingProduct.isActive,
      compatibleVehicles: updatedCompatibleVehicles, 
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
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
