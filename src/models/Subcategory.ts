import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ISubcategory } from "./interfaces/ISubcategory";

const SubcategorySchema = new Schema<ISubcategory>(
    {
       
        name: {
            en: { type: String, required: true, unique: true },
            fr: { type: String },
        },
        slug: { type: String, required: true, unique: true },
        picture: { type: String, required: false, },
        isActive: { type: Boolean, default: false },
        categoryId: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ISubcategory>("Subcategory", SubcategorySchema);
