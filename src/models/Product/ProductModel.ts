import mongoose, { Schema } from "mongoose";
import { IProduct } from ".././interfaces/IProduct"; // Importing the interface

const ProductSchema = new Schema<IProduct>({
    categoryId: { type: String, required: true },
    subcategoryId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: {
        actualPrice: { type: Number, required: true },
        discountPercent: { type: Number, required: true, default: 0 }
    },
    brand: { type: String, required: true },
    picture: { type: [String], required: true },
    quantity: { type: Number, required: true, default: 0 }, 
    isActive: { type: Boolean, required: true, default: true } 
}, {
    timestamps: true
});

// Exporting the model
export default mongoose.model<IProduct>("Product", ProductSchema);
