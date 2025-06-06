import { Schema, model } from 'mongoose';
import { IAddress, AddressType } from '../models/interfaces/IAddress';

const addressSchema = new Schema<IAddress>({
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressType: {
        type: String,
        enum: Object.values(AddressType),
        // default: AddressType.SHIPPING
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' } // Assuming you have a User model
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Address = model<IAddress>('Address', addressSchema);
export default Address;