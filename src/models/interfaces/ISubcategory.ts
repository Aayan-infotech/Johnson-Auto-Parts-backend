import { Document } from "mongoose";

export interface ISubcategory extends Document {
    subcategoryId: string;
    name: string;
    slug: string;
    picture: string;
    categoryId: string;
}
