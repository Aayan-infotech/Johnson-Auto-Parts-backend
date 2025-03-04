import { Document } from "mongoose";

export interface ICategory extends Document {
    categoryId: string;
    name: {
        en: string;
        es?: string;
        fr?: string;
      };
    slug: string;
    isActive: boolean;
}