import { Request, Response } from 'express';
import Address from '../../models/AddressModel';
import { IAddress, AddressType } from '../../models/interfaces/IAddress';
import User from '../../models/User';
import { Types } from 'mongoose';
// import { getAddresses } from './AddressController';

interface AuthRequest extends Request {
    user?: { userId: string; email: string };
}

// Create or Update Address Document
// export const createOrUpdateAddress = async (req: AuthRequest, res: Response) => {
//     try {
//         const userId = req.user?.userId;
//         const { billingAddress, shippingAddress } = req.body;

//         const existingAddress = await Address.findOne({ user: userId }); 

//         // Upsert the address document
//         const address = await Address.findOneAndUpdate(
//             { user: userId },
//             {
//                 user: userId,
//                 billingAddress,
//                 shippingAddress
//             },
//             {
//                 new: true,
//                 upsert: true // Create if doesn't exist
//             }
//         );

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: existingAddress ? "Address updated successfully!" : "Address created successfully!",
//             data: address
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error saving addresses', error });
//     }
// };

interface CreateAddressParams {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
    addressType: AddressType;
    userId: string;
}

export async function createAddress(params: CreateAddressParams) {
    try {
        const {
            fullName,
            street,
            city,
            state,
            postalCode,
            country,
            phoneNumber,
            addressType,
            userId
        } = params;

        const newAddress = new Address({
            fullName,
            street,
            city,
            state,
            postalCode,
            country,
            phoneNumber,
            addressType,
            user: userId
        });

        const savedAddress = await newAddress.save();

        return {
            success: true,
            status: 201,
            message: `${addressType} address created successfully`,
            data: savedAddress
        };
    } catch (error) {
        throw {
            success: false,
            status: 500,
            message: 'Error creating address',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export const getAddresses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId; // Get addresses for the authenticated user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            })
        }
        const addresses = await Address.find({ user: userId });

        res.status(200).json({
            success: true,
            status: 200,
            message: "Address fetched successfully!",
            data: addresses
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses', error });
    }
};

export const getAddressById = async (req: AuthRequest, res: Response) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user?.userId // Ensure the address belongs to the authenticated user
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "Address fethced successfully!",
            data: address
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching address', error });
    }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const deletedAddress = await Address.findOneAndDelete({
            _id: id,
            user: req.user?.userId
        });

        if (!deletedAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: `${deletedAddress.addressType} address deleted successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error
        });
    }
};

// export const getAddresses = async (req: AuthRequest, res: Response) => {
//     try {
//         const userId = req.user?.userId;
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: "User not found!"
//             });
//         }

//         const addresses = await Address.find({ user: userId });

//         // Group by addressType
//         const groupedAddresses = addresses.reduce((acc, address) => {
//             if (!acc[address.addressType]) {
//                 acc[address.addressType] = [];
//             }
//             acc[address.addressType].push(address);

//             // console.log(acc[address.addressType])
//             acc[address.addressType].push(address);
//             return acc;

//         }, {} as Record<AddressType, IAddress[]>);

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Addresses fetched successfully!",
//             // addresses
//             data: {
//                 billing: groupedAddresses[AddressType.BILLING] || [], // Fallback to empty array
//                 shipping: groupedAddresses[AddressType.SHIPPING] || []
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching addresses',
//             error: error instanceof Error ? error.message : "Unknown error"
//         });
//     }
// };

// Get addresses by type

export const getAddressesByType = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            })
        }

        const addresses = await Address.find({ user: userId });

        // const billingAddresses = await Address.find({user: userId, type: AddressType.BILLING});
        // const shippingAddress = await Address.find({user: userId, type: AddressType.SHIPPING});
        // Ensure both types exist in response
        // const organizedAddresses = {
        //     ...billingAddresses  ,
        //     ...shippingAddress
        // };

        res.status(200).json({
            success: true,
            status: 200,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update specific address
export const updateAddress = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedAddress = await Address.findOneAndUpdate(
            {
                _id: id,
                user: req.user?.userId // Ensure user owns the address
            },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: `${updatedAddress.addressType} address updated successfully`,
            data: updatedAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error
        });
    }
};

// Update Billing Address Only
// export const updateBillingAddress = async (req: AuthRequest, res: Response) => {
//     try {
//         const address = await Address.findOneAndUpdate(
//             { user: req.user?.userId },
//             { billingAddress: req.body },
//             { new: true }
//         );

//         if (!address) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'Address document not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Billing address updated successfully!"
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating billing address', error });
//     }
// };

// // Update Shipping Address Only
// export const updateShippingAddress = async (req: AuthRequest, res: Response) => {
//     try {
//         const address = await Address.findOneAndUpdate(
//             { user: req.user?.userId },
//             { shippingAddress: req.body },
//             { new: true }
//         );

//         if (!address) {
//             return res.status(404).json({
//                 success: true,
//                 status: 200,
//                 message: 'Address document not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Shipping Address updated successfully!"
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating shipping address', error });
//     }
// };
