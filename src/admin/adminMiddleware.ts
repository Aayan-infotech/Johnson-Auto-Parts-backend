import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import getConfig from "../config/loadConfig";

interface AdminAuthRequest extends Request {
    user?: {email: string ,role:string};
}

const verifyAdminToken = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    const config = await getConfig();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing', status: 401 });
    }

    try {
        const jwtAccess: any = config.JWT_ACCESS_SECRET;
        const decoded: any=jwt.verify(token, jwtAccess);
        req.user = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ message:error, status: 401 });
    }
};

export {
    verifyAdminToken
}