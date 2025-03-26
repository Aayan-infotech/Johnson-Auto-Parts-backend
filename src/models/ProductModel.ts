import mongoose, { Schema } from "mongoose";
import { IProduct } from "./interfaces/IProduct"; // Importing the interface

const ProductSchema = new Schema<IProduct>(
  {
    Category: { type: String, required: true },
    SubCategory: { type: String },
    SubSubcategory: { type: String },
    name: { en: { type: String, required: true }, fr: { type: String } },
    description: { en: { type: String, required: true }, fr: { type: String } },
    price: {
      actualPrice: { type: Number, required: true },
      discountPercent: { type: Number, required: true, default: 0 },
    },
    brand: { en: { type: String, required: true }, fr: { type: String } },
    picture: { type: [String], required: true },
    quantity: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
