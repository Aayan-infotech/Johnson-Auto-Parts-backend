import { Document } from "mongoose";

export interface ICategory extends Document {
  categoryId: string;
  name: {
    en: string;
    fr?: string;
  };
  slug: string;
  isActive: boolean;
}