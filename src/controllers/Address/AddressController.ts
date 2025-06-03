import { Request, Response } from 'express';
import Address from '../../models/AddressModel';
// import { IAddress } from '../../models/interfaces/IAddress';
import User from '../../models/User';
interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, street, city, state, postalCode, country, phoneNumber } = req.body;
    const userId = req.user?.userId; // Assuming you have authentication middleware that adds user to request

    const newAddress = new Address({
      fullName,
      street,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      user: userId
    });

    const savedAddress = await newAddress.save();
    res.status(201).json({
        success: true, 
        status: 201, 
        message: "Address created successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating address', error });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId; // Get addresses for the authenticated user
    const user = await User.findById(userId)
    if(!user){
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
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.userId // Ensure the address belongs to the authenticated user
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ 
        success: true,
        status: 200,
        message: 'Address deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error });
  }
};