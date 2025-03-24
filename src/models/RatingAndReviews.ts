import mongoose, { Schema } from "mongoose";
import { IReview } from "./interfaces/RatingAndReview";

const ReviewSchema = new Schema<IReview>({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>("Review", ReviewSchema);
