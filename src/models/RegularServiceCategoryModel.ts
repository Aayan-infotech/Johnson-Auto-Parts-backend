import mongoose, { Schema } from "mongoose";
import { IRegularServiceCategory } from "./interfaces/IRegularServiceCategory";

const RegularServiceSchema = new Schema<IRegularServiceCategory>(
  {
    name: {
      en: { type: String, required: true },
      fr: { type: String, required: true },
    },
    description: {
      en: { type: String, default: "" },
      fr: { type: String, default: "" },
    },
    image: {
      type: String,
      default: null,
    },
    categoryDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRegularServiceCategory>(
  "RegularService",
  RegularServiceSchema
);
