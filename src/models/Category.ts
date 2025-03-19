import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICategory } from "./interfaces/ICategory";

const CategorySchema = new Schema<ICategory>(
    {
        categoryId: {
            type: String,
            required: true,
            unique: true,
            default: () => `cat-${uuidv4().split('-')[0]}`
        },
        name: {
            en: { type: String, required: true },
            fr: { type: String },
          },
        slug: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
