import { Schema, model, Document, Types } from "mongoose";

export interface IModel extends Document {
  modelName: string;
  modelImage: string[];
  company:Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const modelSchema = new Schema<IModel>(
  {
    modelName: { type: String, required: true },
    modelImage: [{ type: String, required: true }],
    company: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const ModelModel = model<IModel>("Model", modelSchema);
export default ModelModel;
