// import { Request, Response } from "express";
// import Order from "../../models/OrderModel";
// import Cart from "../../models/CartModel";

// interface AuthRequest extends Request {
//     user?: { userId: string; email: string };
//   }

//   export const placeOrder = async (req: AuthRequest, res: Response) => {
//     try {
//       const userId = req.user?.userId;
//       if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  
//       // Find user's cart
//       const cart = await Cart.findOne({ user: userId }).populate("items.product");
//       if (!cart || cart.items.length === 0) {
//         return res.status(400).json({ success: false, message: "Cart is empty" });
//       }
  
//       // Create order
//       const order = await Order.create({
//         user: userId,
//         items: cart.items.map((item) => {
//           const product: any = item.product; // Ensure TypeScript knows it's populated
//           const discountedPrice = product.price.actualPrice * (1 - product.price.discountPercent / 100);
  
//           return {
//             product: product._id,
//             quantity: item.quantity,
//             price: discountedPrice, // Only storing discounted price
//           };
//         }),
//         totalAmount: cart.items.reduce(
//           (total, item) =>
//             total +
//             item.quantity *
//               item.product.price.actualPrice *
//               (1 - item.product.price.discountPercent / 100),
//           0
//         ),
//       });
  
//       // Clear cart after placing order
//       await Cart.findOneAndUpdate({ user: userId }, { items: [] });
  
//       return res.status(201).json({
//         success: true,
//         message: "Order placed successfully",
//         order,
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: "Error placing order", error: error.message });
//     }
//   };
  
