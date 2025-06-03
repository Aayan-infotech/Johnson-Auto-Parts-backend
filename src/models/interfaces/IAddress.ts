import { Types } from "mongoose";

export interface IAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  user?: string; // Reference to the user who owns this address
}