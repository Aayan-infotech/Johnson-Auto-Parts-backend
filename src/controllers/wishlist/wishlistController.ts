import { Request, Response } from "express";
import Wishlist from "../../models/WishlIstModel";
import Product from "../../models/ProductModel";
import User from "../../models/User";
import mongoose from "mongoose";
import { extractUserFromToken } from "../../utills/authUtils";

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

declare module "express-session" {
  interface SessionData {
    wishlist?: { productId: string; name: string; picture: string[] }[];
  }
}

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {

      
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (req.user) {
      let wishlist = await Wishlist.findOne({ user: req.user.userId }).populate(
        "items.product"
      );

      if (!wishlist) {
        wishlist = new Wishlist({ user: req.user.userId, items: [] });
      }

      const existingItem = wishlist.items.some((item) =>
        item.product instanceof mongoose.Types.ObjectId
          ? item.product.toString() === productId
          : (item.product as any)._id.toString() === productId
      );

      if (!existingItem) {
        wishlist.items.push({ product: productId });
        await wishlist.save();
        
        // Get updated wishlist with populated products
        const updatedWishlist = await Wishlist.findById(wishlist._id)
          .populate("items.product")
          .lean();
        
        return res.status(200).json({
          success: true,
          message: "Product added to wishlist",
          wishlist: updatedWishlist?.items.map(item => ({
            product: item.product
          }))
        });
      }

      // Return existing wishlist even if product was already present
      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
        wishlist: wishlist.items.map(item => ({ product: item.product }))
      });
    } else {
      if (!req.session.wishlist) {
        req.session.wishlist = [];
      }

      if (!req.session.wishlist.some((item) => item.productId === productId)) {
        req.session.wishlist.push({
          productId,
          name: product.name.en,
          picture: product.picture,
        });
      }

      await req.session.save();
      return res.status(200).json({
        success: true,
        message: "Product added to wishlist (Guest)",
        wishlist: req.session.wishlist.map(item => ({
          product: {
            _id: item.productId,
            name: item.name,
            picture: item.picture
          }
        }))
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
      error: (error as Error).message,
    });
  }
};

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;

    if (req.user) {
      const wishlist = await Wishlist.findOne({
        user: req.user.userId,
      }).populate("items.product");
      return res.status(200).json({
        success: true,
        message: wishlist
          ? "Wishlist fetched successfully"
          : "Wishlist is empty",
        wishlist: wishlist || { items: [] },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully (Guest)",
      wishlist: req.session.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error: (error as Error).message,
    });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;
    const { productId } = req.params;

    if (req.user) {
      const wishlist = await Wishlist.findOne({ user: req.user.userId });
      if (!wishlist) {
        return res
          .status(404)
          .json({ success: false, message: "Wishlist not found" });
      }

      wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== productId
      );
      await wishlist.save();

      return res
        .status(200)
        .json({ success: true, message: "Product removed from wishlist" });
    } else {
      if (!req.session.wishlist) {
        return res
          .status(404)
          .json({ success: false, message: "Wishlist not found (Guest)" });
      }

      req.session.wishlist = req.session.wishlist.filter(
        (item) => item.productId !== productId
      );
      await req.session.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist (Guest)",
        wishlist: req.session.wishlist,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
      error: (error as Error).message,
    });
  }
};

export const clearWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;

    if (req.user) {
      await Wishlist.findOneAndDelete({ user: req.user.userId });
      return res
        .status(200)
        .json({ success: true, message: "Wishlist cleared successfully" });
    }

    // ⭐ Guest User Wishlist
    req.session.wishlist = [];
    await req.session.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Wishlist cleared successfully (Guest)",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
      error: (error as Error).message,
    });
  }
};
