import { Document } from "mongoose";

export interface ISubSubcategory extends Document {
    
    name: {
        en: string;
        fr?: string;
    };
    slug: string;
    picture: string;
    subcategoryId: string;
    categoryId: string;
    isActive: boolean;
}
