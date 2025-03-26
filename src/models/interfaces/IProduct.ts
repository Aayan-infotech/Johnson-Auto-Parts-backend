import { Document } from "mongoose";

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
  picture: [string];
  quantity: number;
  isActive: boolean;
}
