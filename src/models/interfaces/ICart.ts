import { Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  name: Object;
  picture: string[];
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}
