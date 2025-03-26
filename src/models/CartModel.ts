import mongoose, { Schema } from "mongoose";
import { ICart } from "./interfaces/ICart";

const CartSchema = new Schema<ICart>({
  user: { type: String, ref: "User", required: true }, // Change ObjectId to String
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true, default: 0 },
}, { timestamps: true });


export default mongoose.model<ICart>("Cart", CartSchema);
