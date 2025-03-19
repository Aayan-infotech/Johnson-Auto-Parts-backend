import mongoose, { Document, Schema } from "mongoose";
import {IUser} from "./interfaces/IUser";
import { v4 as uuidv4 } from "uuid";


const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: () => `user-${uuidv4().split('-')[0]}`
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
    },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type : Boolean, default: false },
    refreshToken:{type:String},
    otp: { type: String},
    otpExpiry: { type: Date},
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);