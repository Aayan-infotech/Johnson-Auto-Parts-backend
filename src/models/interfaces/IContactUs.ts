// interfaces/IContactUs.ts
import { Document } from 'mongoose';

export interface IContactUs extends Document {
  userId?: string;
  email: string;
  message: string;
  response: string;
  phone?: string;
  queryNo: string;
  createdAt: Date;
}
