import { Document } from "mongoose";

export interface IStaticPage extends Document {
 key: string;
 content: string;
}