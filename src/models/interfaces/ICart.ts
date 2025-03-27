import { Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId; 
  quantity: number;
  price: number; 
}

export interface ICart {
  user: Types.ObjectId; 
  items: ICartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}
