import { Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  email: string;
  mobile: string;
  password: string;
  isActive: boolean;
  refreshToken: string;
  otp?: string;
  otpExpiry?: Date;
}