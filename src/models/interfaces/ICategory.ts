import { Document } from "mongoose";

export interface ICategory extends Document {
  name: {
    en: string;
    fr?: string;
  };
  image: String;
  slug: string;
  isActive: boolean;
}
