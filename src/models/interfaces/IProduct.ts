import { Document, Types } from "mongoose";

export interface IProduct extends Document {

  Category: Types.ObjectId; 
  SubCategory?: Types.ObjectId | null; 
  SubSubcategory?: Types.ObjectId | null; 

  name: { en: string; fr?: string };
  description: { en: string; fr?: string };
  price: {
    actualPrice: number;
    discountPercent: number;
  };
  partNo: string;
  brand: { en: string; fr?: string };
  picture: string[];

  quantity: number;
  isActive: boolean;
}
