import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from "../models/User";

interface AuthRequest extends Request {
    user?: { userId: string; email: string };
}

const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing', status: 401 });
    }

    try {
        const jwtAccess: any = process.env.JWT_ACCESS_SECRET || '';
        const decoded: any=jwt.verify(token, jwtAccess);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message:error, status: 401 });
    }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is missing', status: 401 });
    }

    try {
        const jwtRef: any = process.env.JWT_REFRESH_SECRET || '';
        
        const decoded: any = jwt.verify(refreshToken, jwtRef);
        const userId = decoded.userId;

        const storedToken = await User.findOne({ userId, refreshToken });

        if (!storedToken) {
            return res.status(403).json({ message: 'Invalid refresh token', status: 403 });
        }

        const newAccessToken = jwt.sign(
            { userId, email: decoded.email },
            process.env.JWT_ACCESS_SECRET || '',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Access token refreshed',
            accessToken: newAccessToken,
            status: 200,
        });
    } catch (error) {
        return res.status(401).json({ message:error, status: 401 });
    }
};

export {verifyAccessToken , refreshAccessToken};
