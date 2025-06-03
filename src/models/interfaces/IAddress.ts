import { Types } from "mongoose";

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping'
}

export interface IAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  addressType: AddressType;
  user?: Types.ObjectId; // Reference to the user who owns this address
  isDefault?: boolean;
}

// import { Types } from "mongoose";

// export interface IAddressFields {
//     fullName: string;
//     street: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country: string;
//     phoneNumber: string;
// }

// export interface IAddress {
//     user: Types.ObjectId; // Reference to the user who owns this address
//     billingAddress: IAddressFields;
//     shippingAddress: IAddressFields;
// }