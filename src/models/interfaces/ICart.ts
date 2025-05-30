import { Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  discountPercent:number
  name: Object;
  picture: string[];
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  totalDiscountPercentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}
