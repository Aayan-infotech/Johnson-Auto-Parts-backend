import { Document } from "mongoose";

export interface ISubcategory extends Document {
    name: {
        en: string;
        fr?: string;
    };
    slug: string;
    picture: string;
    categoryId: string;
    isActive: boolean;
}
