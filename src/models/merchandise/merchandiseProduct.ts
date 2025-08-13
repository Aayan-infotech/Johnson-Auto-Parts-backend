import mongoose from "mongoose";

const merchandiseProductSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    description: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    brand: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    price: {
      actualPrice: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
    },
    quantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    picture: [{ type: String }],
    sizes: [String], // ["S", "M", "L", "XL"]
    colors: [String], // ["Black", "Red"]
    material: { type: String },
    category: { type: String, required: true }, // "Shoes", "Jackets", etc.
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("MerchandiseProduct", merchandiseProductSchema);
