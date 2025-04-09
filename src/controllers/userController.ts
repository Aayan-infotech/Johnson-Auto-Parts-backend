import jwt from "jsonwebtoken";
import e, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import {
  generateOTP,
  sendEmail,
  generateResetToken,
} from "../utills/generateOtp";
import asyncHandler from "express-async-handler";
import { mergeCartOnLogin } from "../middleware/mergeCartOnLogin";
import getConfig from "../config/loadConfig";
import dotenv from "dotenv";
import { mergeWishlistOnLogin } from "../middleware/mergeWishListOnLogin";
dotenv.config();

const config = getConfig();

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
  fileLocations?: string[]; // Adjust the type as needed
}


const signUp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "All fields are required",
        status: 400,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(402).json({
        message: "User already exists",
        status: 402,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(200).json({
      message: "User registered successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error,
      status: 500,
    });
  }
};

const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials", status: 401 });
    }

    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      (await config).JWT_ACCESS_SECRET as string,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      (await config).JWT_REFRESH_SECRET as string,
      { expiresIn: "30d" }
    );

    await User.updateOne({ _id: user._id }, { refreshToken });

    (req as any).user = { userId: user._id.toString(), email: user.email };

    // Modify merge functions to not send responses, but just return a result or log errors
    try {
      await mergeCartOnLogin(req, res,()=>{});
    } catch (cartError) {
      console.error("Cart merge error:", cartError);
    }

    try {
      await mergeWishlistOnLogin(req, res,()=>{});
    } catch (wishlistError) {
      console.error("Wishlist merge error:", wishlistError);
    }

    // Send the final response only after merging
    return res.status(200).json({
      message: "Login successful",
      data: {
        userId: user._id.toString(),
        accessToken,
        refreshToken,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    });
  }
};


const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        message: "User not found",
        status: 400,
      });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP is: ${otp}. It is valid for 10 minutes.`
    );

    return res.json({
      message: "OTP sent to email",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      messages: error,
      status: 500,
    });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const userData = await User.findOne({ email });

    if (!userData || userData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP. Please use valid OTP.",
        status: 400,
      });
    }
    if (!userData || new Date() > new Date(userData.otpExpiry!)) {
      return res.status(400).json({
        message: "Your OTP has expired.",
        status: 400,
      });
    }

    userData.otp = undefined;
    userData.otpExpiry = undefined;
    await userData.save();

    const resetToken = generateResetToken(userData.userId);
    return res.status(200).json({
      message: "OTP verified successfully",
      status: 200,
      resetToken: resetToken,
    });
  } catch (error) {
    return res.status(404).json({
      messages: error,
      status: 500,
    });
  }
};

const restPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user;
    const userData = await User.findOne({ userId });

    if (!userData) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    userData.password = await bcrypt.hash(newPassword, 10);
    await userData.save();

    return res.status(200).json({
      messages: "Password reset successful",
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      messages: error,
      status: 404,
    });
  }
};
const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userExists = await User.findById(userId).select("-password");

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User Does not exists",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user Details fetched Succesfully.",
      user: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching  user Details",
    });
  }
};
// Get All Users with Pagination
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .select("-password")
    .skip(skip)
    .limit(limit)
    .lean();

  if (users.length === 0) {
    res.status(404).json({
      success: false,
      status: 404,
      message: "No users found!",
    });
    throw new Error("No users found!");
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "Users fetched successfully!",
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers,
    data: users,
  });
});

// block/unblock user
const blockUnblockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    // console.log(userId)

    const user = await User.findOne({ userId: userId });
    // console.log(user)

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found!",
      });
    }

    user.isActive = !user.isActive;
    await user.save();
    // console.log(user);

    res.status(200).json({
      success: true,
      status: 200,
      message: `User ${user.isActive ? "unblocked" : "blocked"} successfully!`,
      data: user.isActive,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error,
    });
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const image=req.fileLocations
    console.log(image);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { fullName, mobile, isActive, oldPassword, newPassword } = req.body;

    const updateFields: Partial<{
      name: string;
      password: string;
      mobile: string;
      isActive: boolean;
      profilePicture:string;
    }> = {};

    if (fullName) updateFields.name = fullName;
    if (mobile) updateFields.mobile = mobile;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (image) updateFields.profilePicture = image[0];

    if (oldPassword && newPassword) {
      const user = await User.findById(userId).select("+password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Check if old password is correct
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect old password" });
      }

      // Hash the new password before updating
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
      select: "-password -refreshToken -otp -otpExpiry", // Exclude sensitive fields from response
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error as string,
    });
  }
};

export {
  signUp,
  login,
  forgotPassword,
  verifyOtp,
  updateUser,
  restPassword,
  getAllUsers,
  blockUnblockUser,
  getUserDetails,
};
