import { Document } from "mongoose";

export interface IFaq extends Document {
  question: {
    en: string
    fr?: string,
  };
  answer: {
    en: string
    fr?: string,
  };
};