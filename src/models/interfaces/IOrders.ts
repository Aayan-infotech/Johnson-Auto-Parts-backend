import { Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId; // Reference to Product model
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId; // Reference to User model
  items: IOrderItem[]; // List of ordered products
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
