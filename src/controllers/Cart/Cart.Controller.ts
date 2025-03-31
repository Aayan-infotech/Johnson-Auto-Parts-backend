import { Request, Response } from "express";
import Cart from "../../models/CartModel";
import Product from "../../models/ProductModel";
import User from "../../models/User"; // Ensure this is imported
import mongoose from "mongoose";
import { extractUserFromToken } from "../../utills/authUtils";

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}


// Extend SessionData to include the cart
declare module "express-session" {
  interface SessionData {
    cart?: {
      items: { productId: string; quantity: number; price: number; name: object; picture: string[] }[];
      totalPrice: number;
    };
  }
}

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined; // Assign user if exists
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.quantity) {
      return res.status(409).json({ success: false, message: "Insufficient stock available" });
    }

    const discountedPrice =
      product.price.actualPrice - (product.price.actualPrice * (product.price.discountPercent || 0)) / 100;
    const name = product.name;
    const picture = product.picture;

    if (req.user) {

      // User is logged in, update their database cart
      let cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        cart = new Cart({ user: req.user.userId, items: [], totalPrice: 0 });
      }

      const existingItem = cart.items.find((item) => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price: discountedPrice, name: name, picture: picture });
      }


      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      await cart.save();

      return res.status(200).json({ success: true, message: "Product added to cart", cart });
    } else {
      // Guest user, store in session
      if (!req.session.cart) {
        req.session.cart = { items: [], totalPrice: 0 };
      }

      const cart = req.session.cart;
      const existingItem = cart.items.find((item) => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price: discountedPrice, name: name, picture: picture });
      }

      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      req.session.cart = cart;
      await req.session.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart (Guest)",
        cart: req.session.cart,
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: (error as Error).message,
    });
  }
};


export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;

    if (req.user) {
      const existingUser = await User.findById(new mongoose.Types.ObjectId(req.user.userId));

      if (!existingUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const cart = await Cart.findOne({ user: existingUser._id }).populate("items.product");

      return res.status(200).json({
        success: true,
        message: cart ? "Cart fetched successfully" : "Cart is empty",
        cart: cart || { items: [], totalPrice: 0 },
      });
    }

    // 🔍 Debugging Logs for Session Cart
    console.log("Session ID in getCart:", req.sessionID);
    console.log("Session Data in getCart:", req.session);
    console.log("Session Cart in getCart:", req.session.cart);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully (Guest)",
      cart: req.session.cart || { items: [], totalPrice: 0 },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: (error as Error).message,
    });
  }
};


export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;

    // 🛒 User-Based Cart
    if (req.user) {
      const existingUser = await User.findOne({ userId: req.user.userId });
      if (!existingUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const cart = await Cart.findOne({ user: existingUser._id });
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }

      const item = cart.items.find((item) => item.product.toString() === productId);
      if (!item) {
        return res.status(404).json({ success: false, message: "Product not in cart" });
      }

      const product = await Product.findById(productId);
      if (!product || quantity > product.quantity) {
        return res.status(409).json({ success: false, message: "Insufficient stock available" });
      }

      item.quantity = quantity;
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      await cart.save();

      return res.status(200).json({ success: true, message: "Cart updated successfully", cart });
    }

    // 🛒 Session-Based Cart (Guest User)
    if (!req.session.cart) {
      return res.status(404).json({ success: false, message: "Cart not found (Guest)" });
    }

    const cart = req.session.cart;
    const item = cart.items.find((item) => item.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    const product = await Product.findById(productId);
    if (!product || quantity > product.quantity) {
      return res.status(409).json({ success: false, message: "Insufficient stock available" });
    }

    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    req.session.cart = cart; // Update session cart

    return res.status(200).json({ success: true, message: "Cart updated successfully (Guest)", cart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: (error as Error).message,
    });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined; // Assign user if exists

    const { productId } = req.params;

    if (req.user) {
      // User is logged in, remove from database cart
      const cart = await Cart.findOne({ user: req.user.userId });
      if (!cart)
        return res.status(404).json({ success: false, message: "Cart not found" });

      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      await cart.save();
      return res.status(200).json({ success: true, message: "Product removed from cart", cart });
    } else {
      // Guest user, remove from session cart
      if (!req.session.cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }

      req.session.cart.items = req.session.cart.items.filter((item) => item.productId !== productId);
      req.session.cart.totalPrice = req.session.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      await req.session.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from cart (Guest)",
        cart: req.session.cart,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
      error: (error as Error).message,
    });
  }
};


export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await extractUserFromToken(req.headers.authorization);
    req.user = user || undefined;

    if (req.user) {
      // Logged-in user: Clear cart from the database
      const existingUser = await User.findOne({ userId: req.user.userId });
      if (!existingUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      await Cart.findOneAndDelete({ user: existingUser._id });

      return res.status(200).json({ success: true, message: "Cart cleared successfully" });
    }

    // Guest user: Clear cart from session
    req.session.cart = { items: [], totalPrice: 0 };
    await req.session.save();

    return res.status(200).json({ success: true, message: "Cart cleared successfully (Guest)" });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: (error as Error).message,
    });
  }
};

