import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IRegularServiceCategory } from "./interfaces/IRegularServiceCategory";

const RegualarServiceSchema = new Schema<IRegularServiceCategory>(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    categoryDiscount: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRegularServiceCategory>(
  "RegualarService",
  RegualarServiceSchema
);
