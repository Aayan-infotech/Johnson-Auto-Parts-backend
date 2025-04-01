// src/interfaces/IWishlist.ts
import mongoose, { Document } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Schema.Types.ObjectId; // user reference as ObjectId
  items: {
    product: mongoose.Schema.Types.ObjectId; // product reference as ObjectId
  }[];
}
