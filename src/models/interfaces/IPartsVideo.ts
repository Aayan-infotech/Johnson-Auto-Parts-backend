import { Document } from "mongoose";

export interface IPartsVideo extends Document {
 videoUrl: string;
 title:string;
 description:string;
}