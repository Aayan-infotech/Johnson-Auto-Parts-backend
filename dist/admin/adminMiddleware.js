"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyAdminToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing', status: 401 });
    }
    try {
        const jwtAccess = process.env.JWT_ACCESS_SECRET || '';
        const decoded = jsonwebtoken_1.default.verify(token, jwtAccess);
        req.user = decoded.AdminAuthRequest;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: error, status: 401 });
    }
};
exports.verifyAdminToken = verifyAdminToken;
