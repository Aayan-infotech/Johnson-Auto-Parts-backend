import { Document } from "mongoose";

export interface IRegularServiceCategory extends Document {
  name:string;
  image:string;
  description:{
    en:string,
    fr:string
  };
  categoryDiscount:number
}