import mongoose, { Schema, model } from "mongoose";
import { IPartsVideo } from "./interfaces/IPartsVideo";

const partsVideoSchema = new Schema<IPartsVideo>(
  {
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IPartsVideo>("PartsVideo", partsVideoSchema);
