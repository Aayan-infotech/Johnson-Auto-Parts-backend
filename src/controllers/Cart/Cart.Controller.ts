import { Request, Response } from "express";
import Cart from "../../models/CartModel";
import Product from "../../models/ProductModel";
import User from "../../models/User"; // Ensure this is imported

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, sessionId } = req.body; // sessionId from frontend or generate a new one

    // if (!sessionId) {
    //   return res.status(400).json({ success: false, message: "Session ID is required" });
    // }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.quantity) {
      return res.status(409).json({ success: false, message: "Insufficient stock available" });
    }

    const discountedPrice =
      product.price.actualPrice - (product.price.actualPrice * (product.price.discountPercent || 0)) / 100;

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({ sessionId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: discountedPrice,
      });
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    await cart.save();

    res.status(200).json({ success: true, message: "Product added to cart", cart });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to cart", error: (error as Error).message });
  }
};


export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart) {
      return res.status(200).json({ success: true, message: "Cart is empty", cart: { items: [], totalPrice: 0 } });
    }

    res.status(200).json({ success: true, message: "Cart fetched successfully", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error: (error as Error).message });
  }
};

export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Product not in cart" });

    const product = await Product.findById(productId);
    if (!product || quantity > product.quantity) {
      return res.status(409).json({ success: false, message: "Insufficient stock available" });
    }

    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    await cart.save();

    res.status(200).json({ success: true, message: "Cart updated successfully", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating cart", error: (error as Error).message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();
    res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from cart", error: (error as Error).message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await Cart.findOneAndDelete({ user: user._id });

    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error clearing cart", error: (error as Error).message });
  }
};
