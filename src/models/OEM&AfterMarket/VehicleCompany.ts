import { Schema, model, Document, Types } from "mongoose";

export interface ICompany extends Document {
  companyName: string;
  models?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const companySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true },
    models: [{ type: Schema.Types.ObjectId, ref: "Model" }],
  },    
  { timestamps: true }
);

const CompanyModel = model<ICompany>("Company", companySchema);
export default CompanyModel;
