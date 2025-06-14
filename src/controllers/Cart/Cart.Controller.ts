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
      items: {
        productId: string;
        quantity: number;
        price: number;
        discountPercent: number;
        name: object;
        picture: string[];
      }[];
      totalPrice: number;
      totalDiscountPercentage: number;
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
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (quantity > product.quantity) {
      return res
        .status(409)
        .json({ success: false, message: "Insufficient stock available" });
    }

    const discountedPrice =
      product.price.actualPrice -
      (product.price.actualPrice * (product.price.discountPercent || 0)) / 100;
    const name = product.name;
    const discountPercent = product.price.discountPercent || 0;
    const picture = product.picture;

    if (req.user) {
      // User is logged in, update their database cart
      let cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        cart = new Cart({
          user: req.user.userId,
          items: [],
          totalPrice: 0,
          totalDiscountPercentage: 0,
        });
      }

      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: discountedPrice,
          discountPercent: discountPercent,
          name: name,
          picture: picture,
        });
      }

      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.totalDiscountPercentage = cart.items.reduce(
        (total, item) => total + item.discountPercent * item.quantity,
        0
      );
      await cart.save();

      return res
        .status(200)
        .json({ success: true, message: "Product added to cart" });
    } else {
      // Guest user, store in session
      if (!req.session.cart) {
        req.session.cart = {
          items: [],
          totalPrice: 0,
          totalDiscountPercentage: 0,
        };
      }

      const cart = req.session.cart;
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: discountedPrice,
          discountPercent: discountPercent,
          name: name,
          picture: picture,
        });
      }

      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.totalDiscountPercentage = cart.items.reduce(
        (total, item) => total + item.discountPercent * item.quantity,
        0
      );
      req.session.cart = cart;
      await req.session.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart (Guest)",
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
      const existingUser = await User.findById(
        new mongoose.Types.ObjectId(req.user.userId)
      );

      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const cart = await Cart.findOne({ user: existingUser._id }).populate(
        "items.product"
      );

      return res.status(200).json({
        success: true,
        message: cart ? "Cart fetched successfully" : "Cart is empty",
        cart: cart || { items: [], totalPrice: 0 },
      });
    }

    // GUEST MODE CART HANDLING
    const guestCart = req.session.cart || { items: [], totalPrice: 0,totalDiscountPercentage:0 };

    // Enrich items with full product data
    const enrichedItems = await Promise.all(
      guestCart.items.map(async (item: any) => {
        const product = await Product.findById(item.productId);

        if (!product) return null;

        return {
          _id: item._id || new mongoose.Types.ObjectId(),
          product,
          quantity: item.quantity,
          price: item.price,
          discountPercent: item.discountPercent,
          name: product.name,
        };
      })
    );

    const filteredItems = enrichedItems.filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully (Guest)",
      cart: {
        items: filteredItems,
        totalPrice: guestCart.totalPrice,
        totalDiscountPercentage: guestCart.totalDiscountPercentage,
      },
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

    if (req.user) {
      const existingUser = await User.findOne({ _id: req.user.userId });
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const cart = await Cart.findOne({ user: existingUser._id });
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      const item = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Product not in cart" });
      }

      const product = await Product.findById(productId);
      if (!product || quantity > product.quantity) {
        return res
          .status(409)
          .json({ success: false, message: "Insufficient stock available" });
      }

      item.quantity = quantity;
      item.discountPercent = product.price.discountPercent || 0;
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.totalDiscountPercentage = cart.items.reduce(
        (total, item) => total + item.discountPercent * item.quantity,
        0
      );
      await cart.save();

      return res
        .status(200)
        .json({ success: true, message: "Cart updated successfully", cart });
    }

    if (!req.session.cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found (Guest)" });
    }

    const cart = req.session.cart;
    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    const product = await Product.findById(productId);
    if (!product || quantity > product.quantity) {
      return res
        .status(409)
        .json({ success: false, message: "Insufficient stock available" });
    }

    item.quantity = quantity;
    item.discountPercent = product.price.discountPercent || 0;
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.totalDiscountPercentage = cart.items.reduce(
      (total, item) => total + item.discountPercent * item.quantity,
      0
    );
    req.session.cart = cart;
    await req.session.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Cart updated successfully (Guest)",
        cart,
      });
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
    req.user = user || undefined;

    const { productId } = req.params;

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.totalDiscountPercentage = cart.items.reduce(
        (total, item) => total + item.discountPercent * item.quantity,
        0
      );

      await cart.save();
      return res
        .status(200)
        .json({ success: true, message: "Product removed from cart", cart });
    } else {
      if (!req.session.cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      req.session.cart.items = req.session.cart.items.filter(
        (item) => item.productId !== productId
      );
      req.session.cart.totalPrice = req.session.cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      req.session.cart.totalDiscountPercentage = req.session.cart.items.reduce(
        (total, item) => total + item.discountPercent * item.quantity,
        0
      );

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
      const existingUser = await User.findOne({ userId: req.user.userId });
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await Cart.findOneAndDelete({ user: existingUser._id });

      return res
        .status(200)
        .json({ success: true, message: "Cart cleared successfully" });
    }

    req.session.cart = { items: [], totalPrice: 0, totalDiscountPercentage: 0 };
    await req.session.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart cleared successfully (Guest)" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: (error as Error).message,
    });
  }
};
