import { Request, Response } from "express";
import Order from "../../models/OrderModel";
import Cart from "../../models/CartModel";

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    // const userId = req.user?.userId;
    const userId = "67e3888cdf2552666616a76b";
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { address, payment } = req.body;

    if (!address || !payment) {
      return res.status(400).json({ success: false, message: "Address and payment details are required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = cart.items.map((item) => {
      const product: any = item.product;
      const actualPrice = product?.price?.actualPrice || 0; // Ensure price exists
      const discountPercent = product?.price?.discountPercent || 0;
      const discountedPrice = actualPrice * (1 - discountPercent / 100);

      return {
        product: product._id,
        quantity: item.quantity,
        price: discountedPrice, 
      };
    });

    const totalAmount = items.reduce((total, item) => total + item.quantity * item.price, 0);

    // Create the order
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      status: "pending", // Default status
      address,
      payment,
    });

    // Clear cart after successful order placement
    // await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order", error: error as string });
  }
};
