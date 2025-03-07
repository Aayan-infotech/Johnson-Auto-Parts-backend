import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ISubcategory } from "./interfaces/ISubcategory";

const SubcategorySchema = new Schema<ISubcategory>(
    {
        subcategoryId: {
            type: String,
            required: true,
            unique: true,
            default: () => `subcat-${uuidv4().split('-')[0]}`
        },
        name: {
            en: { type: String, required: true, unique: true },
            fr: { type: String },
        },
        slug: { type: String, required: true, unique: true },
        picture: { type: String, required: false, },
        categoryId: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ISubcategory>("Subcategory", SubcategorySchema);
