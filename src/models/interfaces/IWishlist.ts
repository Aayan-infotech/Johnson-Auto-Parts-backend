import { Types } from "mongoose";

export interface IWishlist {
  user: Types.ObjectId;
  items: Types.ObjectId[]; // Array of product IDs
  createdAt?: Date;
  updatedAt?: Date;
}
