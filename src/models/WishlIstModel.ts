import mongoose, { Schema } from "mongoose";
import { IWishlist } from "./interfaces/IWishlist";

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
       
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);
