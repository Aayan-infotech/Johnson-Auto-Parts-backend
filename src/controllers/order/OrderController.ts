import { Request, Response } from "express";
import Order from "../../models/OrderModel";
import User from "../../models/User";
import Cart from "../../models/CartModel";
import Product from "../../models/ProductModel";
import { makePayment } from "../../utills/SlimCDService";
import { sendOrderConfirmationEmail } from "../../utills/SendOrderCreationEmail";
import { createAddress } from "../Address/AddressController"; // adjust path accordingly

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { address, productId, quantity, cardnumber, expmonth, expyear } =
      req.body;

    if (!address || !cardnumber || !expmonth || !expyear) {
      return res.status(400).json({
        success: false,
        message: "Address and complete card details are required",
      });
    }

    // ✅ Step 1: Create address using the service
    const addressResponse = await createAddress({
      ...address,
      userId,
    });

    if (!addressResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to save address",
        error: addressResponse.message,
      });
    }

    const savedAddress = addressResponse.data; // Contains the saved address document

    let items = [];

    if (productId && quantity) {
      const product = await Product.findById(productId);
      if (!product || product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Product not available or insufficient quantity",
        });
      }

      const actualPrice = product.price?.actualPrice || 0;
      const discountPercent = product.price?.discountPercent || 0;
      const discountedPrice = actualPrice * (1 - discountPercent / 100);

      items.push({
        product: product._id,
        quantity,
        price: discountedPrice,
      });
    } else {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }

      items = cart.items.map((item) => {
        const product: any = item.product;
        const actualPrice = product?.price?.actualPrice || 0;
        const discountPercent = product?.price?.discountPercent || 0;
        const discountedPrice = actualPrice * (1 - discountPercent / 100);

        return {
          product: product._id,
          quantity: item.quantity,
          price: discountedPrice,
        };
      });
    }

    const totalAmount = Number(
      items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2)
    );
    // const totalAmount = Number(totalAmount);

    // ✅ Process payment after validation
    const paymentResult = await makePayment({
      amount: totalAmount,
      cardnumber,
      expmonth,
      expyear,
    });

    if (paymentResult.reply.response !== "Success") {
      return res.status(400).json({
        success: false,
        message: "Payment failed",
        error: paymentResult.description,
      });
    }

    // ✅ Step 2: Create order using the saved address._id
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      status: "processing",
      address: savedAddress._id,
      payment: {
        method: "card",
        status: "paid",
        transactionId: paymentResult.transactionId,
      },
    });

    // ✅ Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity, salesCount: item.quantity },
      });
    }

    if (!productId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    const user = await User.findById(userId);

    if (user?.email) {
      try {
        const populatedItems = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findById(item.product).lean();
            return { ...item, product };
          })
        );

        await sendOrderConfirmationEmail({
          user: { name: user.name, email: user.email },
          address: savedAddress, // send full address object
          order,
          items: populatedItems,
          totalAmount,
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

// get orders for admin panel
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("address"); // <-- populate address here

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "No orders found!",
        data: orders,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error,
    });
  }
};

export const getOrderByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "name price picture",
      })
      .populate("address"); // <-- populate the address here

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "No orders found!",
        data: orders,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error,
    });
  }
};

export const trackOwnOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Order ID is required",
      });
    }

    // Find the order by ID and populate user details (if needed)
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Order not found",
      });
    }

    // Optional: define messages for different statuses
    const statusMessages: Record<string, string> = {
      pending: "Your order is pending...",
      processing: "Your order is being processed...",
      shipped: "Your order has been shipped...",
      delivered: "Your order has been delivered.",
      cancelled: "Your order has been cancelled.",
    };

    // Enhance statusHistory with messages
    const enhancedStatusHistory = (order.statusHistory || []).map(
      (entry: any) => ({
        ...(entry.toObject?.() || entry),
        message: statusMessages[entry.status] || "Status update",
      })
    );

    // Return order details
    res.status(200).json({
      success: true,
      status: 200,
      message: "Order details fetched successfully",
      data: {
        ...order.toObject(),
        statusHistory: enhancedStatusHistory,
      },
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error",
      error,
    });
  }
};

export const changeOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Order not found!",
      });
    }

    // Add to history
    order.statusHistory.push({
      status: order.status,
      date: new Date(),
    });

    order.status = status || order.status;
    await order.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Order fetched successfully!",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error,
    });
  }
};
