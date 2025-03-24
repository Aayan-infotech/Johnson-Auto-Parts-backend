import { Document } from "mongoose";

export interface IProduct extends Document {
    categoryId: string;
    subcategoryId: string;
    name: string;
    description: string;
    price: {
        actualPrice:number;
        discountPercent:number;
    };
    brand: string;
    picture: [string];
    quantity: number;
    isActive: boolean;
}
