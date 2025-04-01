import { Document } from "mongoose";

export interface IUser extends Document {
  name:string;
  userId: string;
  email: string;
  mobile: string;
  password: string;
  isActive: boolean;
  refreshToken: string;
  profilePicture:string;
  otp?: string;
  otpExpiry?: Date;
}