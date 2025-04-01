// import { Request, Response, NextFunction } from "express";
// import session from "express-session";
// import Wishlist from "../models/WishlIstModel";
// import mongoose from "mongoose";

// // Define the WishlistItem type
// interface WishlistItem {
//     productId: string;
//     name: string; // Assuming the name should be a string
//     picture: string[];
//   }
  
//   interface AuthRequest extends Request {
//     user?: { userId: string };
//     session: session.Session & Partial<session.SessionData> & {
//       wishlist?: {
//         items: WishlistItem[]; // Define the type of items in the wishlist
//       };
//     };
//   }
  
  
//   export const mergeWishlistOnLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
//     try {
//       const userId = req.user?.userId;
//       if (!userId) return next(); // No user logged in, skip merging
  
//       if (!req.session.wishlist) {
//         req.session.wishlist = { items: [] }; // This will now be recognized as WishlistItem[]
//       }
  
//       if (req.session.wishlist.items.length === 0) {
//         return next();
//       }
  
//       const sessionWishlist = req.session.wishlist;
//       let userWishlist = await Wishlist.findOne({ user: userId });
  
//       // If no wishlist for user, create a new one
//       if (!userWishlist) {
//         userWishlist = new Wishlist({ user: userId, items: [] });
//       }
  
//       // Use a map to keep track of items in the user's wishlist
//       const wishlistMap = new Map(userWishlist.items.map((item) => [item.product.toString(), item]));
  
//       // Iterate through session wishlist and merge it with user wishlist
//       sessionWishlist.items.forEach((sessionItem) => {
//         const productId = new mongoose.Types.ObjectId(sessionItem.productId);
  
//         if (wishlistMap.has(sessionItem.productId)) {
//           // If product already exists in user wishlist, do nothing (or you can update logic here)
//         } else {
//           // Add the new product to the user's wishlist
//           userWishlist.items.push({
//             product: productId,
//             name: sessionItem.name, // Ensure this is a string
//             picture: sessionItem.picture,
//           });
//         }
//       });
  
//       // Save the updated wishlist
//       await userWishlist.save();
  
//       // Clear the session wishlist
//       req.session.wishlist = { items: [] };
  
//       return next(); // Continue to next middleware/controller
//     } catch (error) {
//       console.error("🔥 Error merging wishlist:", error);
//       res.status(500).json({ success: false, message: "Error merging wishlist", error: error });
//     }
//   };
  
  