import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  Category: string;
  SubCategory: string;
  SubSubcategory: string;
  name: { en: string; fr?: string };
  description: { en: string; fr?: string };
  price: {
    actualPrice: number;
    discountPercent: number;
  };
  brand: { en: string; fr?: string };
  picture: string[];
  quantity: number;
  isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    Category: { type: String, required: true },
    SubCategory: { type: String, required: true },
    SubSubcategory: { type: String, required: true },
    name: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    description: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    price: {
      actualPrice: { type: Number, required: true },
      discountPercent: { type: Number, required: true, default: 0 },
    },
    brand: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    picture: { type: [String] },
    quantity: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
