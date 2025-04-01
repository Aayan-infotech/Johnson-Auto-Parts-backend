// import { Request, Response } from "express";
// import Wishlist from "../models/WishlIstModel";
// import { extractUserFromToken } from "../utills/authUtils";
// import mongoose, { Types } from "mongoose";

// interface AuthRequest extends Request {
//   user?: { userId: string; email: string };
// }

// declare module "express-session" {
//   interface SessionData {
//     wishlist?: { productId: string; name: string; picture: string[] }[];
//   }
// }

// export const mergeWishlistOnLogin = async (req: AuthRequest, res: Response) => {
//   try {
//     const user = await extractUserFromToken(req.headers.authorization);
//     if (!user) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     req.user = user;
//     const sessionWishlist = req.session.wishlist || [];

//     if (sessionWishlist.length === 0) {
//       return res.status(200).json({ success: true, message: "No items to merge" });
//     }

//     let wishlist = await Wishlist.findOne({ user: req.user.userId });
//     if (!wishlist) {
//       wishlist = new Wishlist({ user: req.user.userId, items: [] });
//     }

//     const existingProductIds = new Set<string>(
//       wishlist.items.map((item) => item.product.toString())
//     );

//     sessionWishlist.forEach((sessionItem) => {
//       const productId = new mongoose.Types.ObjectId(sessionItem.productId);

//       if (!existingProductIds.has(productId.toString())) {
//         wishlist.items.push({ product: new mongoose.Types.ObjectId(productId) });
//       }
//     });

//     await wishlist.save();
//     req.session.wishlist = [];
//     await req.session.save();

//     return res.status(200).json({ success: true, message: "Wishlist merged successfully" });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error merging wishlist",
//       error: (error as Error).message,
//     });
//   }
// };
