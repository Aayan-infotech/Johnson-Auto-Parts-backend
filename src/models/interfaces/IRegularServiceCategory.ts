import { Document } from "mongoose";

export interface IRegularServiceCategory extends Document {
  name:{
    en:string,
    fr:string
  };
  image?:string|null;
  description:{
    en:string,
    fr:string
  };
  categoryDiscount:number
}