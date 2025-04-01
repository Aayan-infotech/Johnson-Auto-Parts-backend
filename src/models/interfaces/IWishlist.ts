// src/interfaces/IWishlist.ts
import mongoose, { Document } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;  // Changed from Schema.Types
  items: {
    product: mongoose.Types.ObjectId;  // Changed from Schema.Types
  }[];
}