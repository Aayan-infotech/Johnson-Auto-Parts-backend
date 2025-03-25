import getConfig from "../config/loadConfig";
import jwt from 'jsonwebtoken';
import e, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateOTP, sendEmail, generateResetToken } from '../utills/generateOtp';
import asyncHandler from "express-async-handler";


interface AuthRequest extends Request {
    user?: { userId: string; email: string };
}

const signUp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, mobile, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                status: 400
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            mobile,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(200).json({
            message: "User registered successfully",
            status: 200
        });

    } catch (error) {
        return res.status(404).json({
            messages: error,
            status: 404
        });
    }
}

const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const config = await getConfig();

        const jwtAccess: any = config.JWT_ACCESS_SECRET;
        const jwtRef: any = config.JWT_REFRESH_SECRET;

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                status: 400,
            });
        };

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials",
                status: 400,
            });
        };

        const accessToken = jwt.sign(
            { userId: user.userId, email: user.email },
            jwtAccess,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.userId, email: user.email },
            jwtRef,
            { expiresIn: '30d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            message: "Login successful",
            data: {
                userId: user.userId,
                accessToken,
                refreshToken,
            },
            status: 200,
        });

    } catch (error) {
        return res.status(404).json({
            messages: error,
            status: 404
        });
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({
            message: "User not found",
            status: 400
        });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}. It is valid for 10 minutes.`);

        return res.json({
            message: "OTP sent to email",
            status: 200
        });

    } catch (error) {
        return res.status(404).json({
            messages: error,
            status: 404
        });
    }
}

const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const userData = await User.findOne({ email });

        if (!userData || userData.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP. Please use valid OTP.",
                status: 400
            });
        }
        if (!userData || new Date() > new Date(userData.otpExpiry!)) {
            return res.status(400).json({
                message: "Your OTP has expired.",
                status: 400
            });
        }

        userData.otp = undefined;
        userData.otpExpiry = undefined;
        await userData.save();

        const resetToken = generateResetToken(userData.userId);
        return res.status(200).json({
            message: "OTP verified successfully",
            status: 200,
            resetToken: resetToken
        })

    } catch (error) {
        return res.status(404).json({
            messages: error,
            status: 404
        });
    }
}

const restPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user;
        const userData = await User.findOne({ userId });

        if (!userData) {
            return res.status(404).json({
                message: "User not found",
                status: 404
            });
        }

        userData.password = await bcrypt.hash(newPassword, 10);
        await userData.save();

        return res.status(200).json({
            messages: "Password reset successful",
            status: 200
        })

    } catch (error) {
        return res.status(404).json({
            messages: error,
            status: 404
        });
    }
}


// Get All Users with Pagination
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find().skip(skip).limit(limit).lean();

    if (users.length === 0) {
        res.status(404).json({
            success: false,
            status: 404,
            message: "No users found!"
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
        data: users
    });
});

// block/unblock user
const blockUnblockUser = async(req: Request, res: Response) => {
    try{
        const userId = req.params.userId;
        // console.log(userId)

        const user = await User.findOne({userId: userId});
        // console.log(user)

        if(!user){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            });
        }

        user.isActive = !user.isActive;
        await user.save();
        console.log(user)

        res.status(200).json({
            success: true,
            status: 200,
            message: `User ${user.isActive ? "unblocked" : "blocked"} successfully!`,
            data: user.isActive
        });
    }
    catch(error){
        return res.status(404).json({
            success: false,
            status: 404,
            message: "Internal server error!",
            error: error,
        });
    }
}; 

export {
    signUp,
    login,
    forgotPassword,
    verifyOtp,
    restPassword,
    getAllUsers,
    blockUnblockUser
};