import mongoose, { Schema, Document } from "mongoose";

import { IProduct } from "./interfaces/IProduct"; // Assuming you have an interface file

const ProductSchema = new Schema<IProduct>(
  {
    Category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, 
    SubCategory: { type: Schema.Types.ObjectId, ref: "SubCategory",default:null }, 
    SubSubcategory: { type: Schema.Types.ObjectId, ref: "SubSubcategory",default:null },
    name: { en: { type: String, required: true }, fr: { type: String } },
    description: { en: { type: String, required: true }, fr: { type: String } },
    price: {
      actualPrice: { type: Number, required: true },
      discountPercent: { type: Number, required: true, default: 0 },
    },
    partNo: { type: String, default: null },
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
