import { Request, Response, NextFunction } from "express";
import session from "express-session";
import Cart from "../models/CartModel";
import mongoose from "mongoose";

// Extend Express Request to include user and session
interface AuthRequest extends Request {
  user?: { userId: string };
  session: session.Session &
    Partial<session.SessionData> & {
      cart?: {
        items: {
          productId: string;
          quantity: number;
          price: number;
          discountPercent: number;
          name: object;
          picture: string[];
        }[];
        totalPrice: number;
        totalDiscountPercentage:number
      };
    };
}

export const mergeCartOnLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next();
    if (!req.session.cart || req.session.cart.items.length === 0) {
      return next();
    }

    const sessionCart = req.session.cart;
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const cartMap = new Map(
      userCart.items.map((item) => [item.product.toString(), item])
    );

    sessionCart.items.forEach((sessionItem) => {
      const productId = new mongoose.Types.ObjectId(sessionItem.productId);

      if (cartMap.has(sessionItem.productId)) {
        cartMap.get(sessionItem.productId)!.quantity += sessionItem.quantity;
      } else {
        userCart.items.push({
          product: productId,
          quantity: sessionItem.quantity,
          price: sessionItem.price,
          discountPercent: sessionItem.discountPercent,
          name: sessionItem.name,
          picture: sessionItem.picture,
        });
      }
    });

    userCart.totalPrice = userCart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    userCart.totalDiscountPercentage = userCart.items.reduce(
      (total, item) => total + item.discountPercent * item.quantity,
      0
    );

    await userCart.save();

    req.session.cart = { items: [], totalPrice: 0, totalDiscountPercentage: 0 };

    next();
  } catch (error) {
    console.error("🔥 Error merging cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Error merging cart", error: error });
  }
};
