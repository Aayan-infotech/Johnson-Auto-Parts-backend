import mongoose, { Schema, Document } from 'mongoose';
import { IContact } from './interfaces/IContactUs';

export interface IContactDocument extends IContact, Document {}

const ContactSchema: Schema = new Schema<IContactDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  isReplied: { type: Boolean, default: false },
  reply: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const ContactModel = mongoose.model<IContactDocument>('Contact', ContactSchema);
