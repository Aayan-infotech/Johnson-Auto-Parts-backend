import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IFaq } from "./interfaces/IFaq";

const FaqSchema = new Schema<IFaq>(
    {
        question: {
            en: { type: String, required: true },
            fr: { type: String },
        },
        answer: {
            en: { type: String, required: true },
            fr: { type: String },
          },
    },
    { timestamps: true }
);

export default mongoose.model<IFaq>("faq", FaqSchema);
