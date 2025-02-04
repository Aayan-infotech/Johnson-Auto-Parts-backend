import { Document } from "mongoose";

export interface ICategory extends Document {
    categoryId: string;
    name: string;
    slug: string;
}