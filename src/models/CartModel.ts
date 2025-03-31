import mongoose, { Schema } from "mongoose";
import { ICart } from "./interfaces/ICart";

const CartSchema = new Schema<ICart>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensure ObjectId
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        name: { type: Object, required: true },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
