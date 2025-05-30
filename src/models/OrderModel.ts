import mongoose, { Schema } from "mongoose";
import { IOrder } from "./interfaces/IOrders";

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
    }],
    address: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    payment: {
      method: { type: String, enum: ["card", "paypal", "crypto", "bank_transfer"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      transactionId: { type: String, default: null }, // ID from payment provider (Stripe, PayPal, etc.)
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
