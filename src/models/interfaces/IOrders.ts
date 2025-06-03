import { Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId; // Reference to Product model
  quantity: number;
  price: number;
}

export interface IAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface IPayment {
  method: "credit_card" | "paypal" | "crypto" | "bank_transfer";
  status: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string; // Optional, only exists if payment is completed
}

export interface IOrderStatusHistory {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: Date;
  // Optional: You can add more fields like changedBy or notes if needed
  // changedBy?: Types.ObjectId;
  // notes?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[]; 
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  statusHistory: IOrderStatusHistory[];
  address?: Types.ObjectId; 
  payment: IPayment; 
  createdAt: Date;
  updatedAt: Date;
}
