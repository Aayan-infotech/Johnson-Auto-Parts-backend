import { Document } from "mongoose";

export interface ICategory extends Document {
  name: {
    en: string;
    fr?: string;
  };
  slug: string;
  isActive: boolean;
}