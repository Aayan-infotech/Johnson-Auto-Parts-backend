import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICategory } from "./interfaces/ICategory";

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            en: { type: String, required: true },
            fr: { type: String },
          },
        slug: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
