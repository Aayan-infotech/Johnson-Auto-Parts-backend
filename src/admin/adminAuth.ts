import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./adminModel";

interface AdminAuthRequest extends Request {
    user?: { email: string, role: string };
}

const login = async (req: Request, res: Response) => {
    try {
        const jwtAccess: any = process.env.JWT_ACCESS_SECRET || 'your-access-secret';

        const { email, password } = req.body;

        if (email !== "adminjohnson@yopmail.com") {
            return res.status(401).json({
                message: "Invalid email",
                status: 401,
            });
        }

        let admin = await Admin.findOne({ email: email });

        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin", salt);
            admin = new Admin({
                email: email,
                password: hashedPassword,
            });
            await admin.save();
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password",
                status: 401,
            });
        }
        const token = jwt.sign({ role: "admin", email: email }, jwtAccess, { expiresIn: "1h" });

        return res.status(200).json({
            message: "Login successful",
            status: 200,
            token,
        });

    } catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
}

const changeAdminPass = async (req: AdminAuthRequest, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const email = req.user;
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
                status: 404,
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Old password is incorrect",
                status: 401,
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({
            message: "Password updated successfully",
            status: 200,
        });

    } catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
}

export {
    login,
    changeAdminPass
}