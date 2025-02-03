import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

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
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
}

const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const jwtAccess: any = process.env.JWT_ACCESS_SECRET || '';
        const jwtRef:any = process.env.JWT_REFRESH_SECRET || '';
       
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
            { expiresIn:'1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.userId, email: user.email },
            jwtRef,
            { expiresIn:'30d' }
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
        return res.status(500).json({
            error: error,
        });
    }
}

const aabb=async(req: AuthRequest, res: Response): Promise<Response> => {
    return res.send(req.user)
}

export { signUp, login ,aabb};