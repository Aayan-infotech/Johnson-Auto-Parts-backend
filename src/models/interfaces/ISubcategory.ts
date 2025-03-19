import { Document } from "mongoose";

export interface ISubcategory extends Document {
    subcategoryId: string;
    name: {
        en: string;
        fr?: string;
    };
    slug: string;
    picture: string;
    categoryId: string;
    isActive: boolean;
}
