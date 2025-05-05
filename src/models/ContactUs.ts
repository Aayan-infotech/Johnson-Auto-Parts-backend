// models/ContactUs.ts
import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from "uuid";
import { IContactUs } from '../models/interfaces/IContactUs';

const ContactUsSchema: Schema = new Schema<IContactUs>({
    userId: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        default: ''
    },
    phone: {
        type: String
    },
    queryNo: {
        type: String,
        default: () => `QRY-${uuidv4().split('-')[0].toUpperCase()}`, // short + readable
        unique: true
      },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IContactUs>('ContactUs', ContactUsSchema);