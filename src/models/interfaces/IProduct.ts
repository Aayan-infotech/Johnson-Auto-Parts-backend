import { Document } from "mongoose";

export interface IProduct extends Document {

    SubSubcategory: string;
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
