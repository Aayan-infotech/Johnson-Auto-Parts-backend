import { Request, Response } from "express";
import MerchandiseProduct from "../../models/merchandise/merchandiseProduct";
import { translateText } from "../../utills/translateService";

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
  fileLocations?: string[];
}

export const createMerchandiseProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      brand,
      quantity,
      isActive,
      sizes,
      colors,
      material,
      category,
    } = req.body;

    const productImages = req.fileLocations || [];

    if (!name || !description || !brand || !price || !category) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const nameFr = await translateText(name, "fr");
    const descriptionFr = await translateText(description, "fr");
    const brandFr = await translateText(brand, "fr");

    const merchandiseProduct = new MerchandiseProduct({
      name: { en: name, fr: nameFr },
      description: { en: description, fr: descriptionFr },
      brand: { en: brand, fr: brandFr },
      price: {
        actualPrice: price.actualPrice,
        discountPercent: price.discountPercent ?? 0,
      },
      quantity: quantity ?? 0,
      isActive: isActive ?? true,
      picture: productImages,
      sizes: sizes || [],
      colors: colors || [],
      material: material || "",
      category,
      salesCount: 0,
    });

    await merchandiseProduct.save();

    return res.status(201).json({
      success: true,
      message: "Merchandise product created successfully",
      product: merchandiseProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating merchandise product",
      error: (error as Error).message,
    });
  }
};

export const getAllMerchandiseProducts = async (req: Request, res: Response) => {
  try {
    const products = await MerchandiseProduct.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching merchandise products",
      error: (error as Error).message,
    });
  }
};

export const getMerchandiseProductById = async (req: Request, res: Response) => {
  try {
    const product = await MerchandiseProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving product",
      error: (error as Error).message,
    });
  }
};

export const updateMerchandiseProduct = async (req: Request, res: Response) => {
  try {
    const product = await MerchandiseProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      description,
      brand,
      price,
      quantity,
      sizes,
      colors,
      material,
      category,
      isActive,
    } = req.body;

    if (name) {
      product.name = product.name || { en: "", fr: "" };
      product.name.en = name;
      product.name.fr = await translateText(name, "fr");
    }

    if (description) {
      product.description = product.description || { en: "", fr: "" };
      product.description.en = description;
      product.description.fr = await translateText(description, "fr");
    }

    if (brand) {
      product.brand = product.brand || { en: "", fr: "" };
      product.brand.en = brand;
      product.brand.fr = await translateText(brand, "fr");
    }

    if (price) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (material) product.material = material;
    if (category) product.category = category;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: (error as Error).message,
    });
  }
};
 
export const deleteMerchandiseProduct = async (req: Request, res: Response) => {
  try {
    const deleted = await MerchandiseProduct.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: (error as Error).message,
    });
  }
};
