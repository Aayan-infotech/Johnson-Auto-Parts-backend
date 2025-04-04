import { Request, Response, NextFunction } from "express";
import Wishlist from "../models/WishlIstModel";
import mongoose from "mongoose";
import session from "express-session";

// Extend Express Request to include user and session
interface AuthRequest extends Request {
  user?: { userId: string };
  session: session.Session & Partial<session.SessionData> & {
    wishlist?: { productId: string; name: string; picture: string[] }[];
  };
}

export const mergeWishlistOnLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(); // If no userId in request, move to the next middleware

    // If no wishlist in session or session wishlist is empty, skip
    if (!req.session.wishlist || req.session.wishlist.length === 0) {
      return next();
    }

    // Get session wishlist and user wishlist
    const sessionWishlist = req.session.wishlist;
    let userWishlist = await Wishlist.findOne({ user: userId });

    // If no user wishlist exists, create a new one
    if (!userWishlist) {
      userWishlist = new Wishlist({
        user: userId,
        items: [],
      });
    }

    // Create a map of existing wishlist items for quick look-up by productId
    const existingProductIds = new Set(
      userWishlist.items.map((item) => item.product.toString())
    );

    // Track how many new items will be merged
    let mergedCount = 0;

    // Iterate over session wishlist items
    for (const sessionItem of sessionWishlist) {
      const productId = new mongoose.Types.ObjectId(sessionItem.productId);

      // Check if the product already exists in the user's wishlist
      if (!existingProductIds.has(productId.toString())) {
        // Add the product to the user wishlist if it doesn't exist already
        userWishlist.items.push({
          product: productId,
        //   name: sessionItem.name,
        //   picture: sessionItem.picture,
        });
        mergedCount++;
      }
    }

    // Save the updated wishlist to the database
    if (mergedCount > 0) {
      await userWishlist.save();
    }

    // Clear the session wishlist after merging
    req.session.wishlist = [];

    // Proceed to the next middleware
    return next();
  } catch (error) {
    console.error("🔥 Error merging wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error merging wishlist",
      error: error,
    });
  }
};
