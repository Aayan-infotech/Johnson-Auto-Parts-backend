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
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
