import mongoose, { Schema, Document } from "mongoose";

import { IProduct } from "./interfaces/IProduct";

const ProductSchema = new Schema<IProduct>(
  {
    Category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    SubCategory: { type: Schema.Types.ObjectId, ref: "SubCategory", default: null },
    SubSubcategory: { type: Schema.Types.ObjectId, ref: "SubSubcategory", default: null },
    
    name: { en: { type: String, required: true }, fr: { type: String } },
    description: { en: { type: String, required: true }, fr: { type: String } },

    price: {
      actualPrice: { type: Number, required: true },
      discountPercent: { type: Number, required: true, default: 0 },
    },

    partNo: { type: String, default: null },
    brand: { en: { type: String, required: true }, fr: { type: String } },
    picture: { type: [String], required: true },
    quality: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    regularServiceCategory: { type: Schema.Types.ObjectId,ref: "RegularService" ,default: null },
    autoPartType: { type: String }, // brake, clutch, brake shoe etc

    // ✅ New structure for Year > Make > Model
    compatibleVehicles: [
      {
        make: { type: String, required: true },
        models: [
          {
            model: { type: String, required: true },
            years: [{ type: Number, required: true }]
          }
        ]
      }
    ],

    ratingAndReview: { type: Schema.Types.ObjectId },
    salesCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);


export default mongoose.model<IProduct>("Product", ProductSchema);
