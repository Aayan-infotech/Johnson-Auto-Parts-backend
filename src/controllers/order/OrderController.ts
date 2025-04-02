import { Request, Response } from "express";
import Order from "../../models/OrderModel";
import Cart from "../../models/CartModel";
import Product from "../../models/ProductModel";

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    // const userId = req.user?.userId;
    const userId = "67e3888cdf2552666616a76b";
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { address, payment } = req.body;

    if (!address || !payment) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Address and payment details are required",
        });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = cart.items.map((item) => {
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

    const totalAmount = items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      status: "pending",
      address,
      payment,
    });

    for (const item of cart.items) {
      const product: any = item.product;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -item.quantity }, 
      });
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error placing order",
        error: error as string,
      });
  }
};

export const getOrderByUserId = async(req: Request, res: Response) => {
  try{
    const userId = req.params.userId;

    const orders = await Order.find({user: userId});

    if(orders.length === 0){
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
  }catch(error){
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error,
    });
  }
}

// get orders for admin panel
export const getOrders = async(req: Request, res: Response) => {
  try{
    const orders = await Order.find().populate('user', 'name email');

    if(orders.length === 0){
      return res.status(200).json({
        success: true,
        status: 200,
        message: "No orders found!",
        data: orders
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      data: orders
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error
    });
  }
};

export const changeOrderStatus = async(req: Request, res: Response) => {
  try{
    const orderId = req.params.orderId;
    const {status} = req.body;

    const order = await Order.findById(orderId);
    if(!order){
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Order not found!"
      });
    }

    order.status = status || order.status;
    await order.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Order fetched successfully!",
      data: order
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      status:500,
      message: "Internal server error!",
      error: error
    });
  }
}