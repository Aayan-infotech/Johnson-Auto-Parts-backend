"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.verifyAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const verifyAccessToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing', status: 401 });
    }
    try {
        const jwtAccess = process.env.JWT_ACCESS_SECRET || '';
        const decoded = jsonwebtoken_1.default.verify(token, jwtAccess);
        req.user = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: error, status: 401 });
    }
};
exports.verifyAccessToken = verifyAccessToken;
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is missing', status: 401 });
    }
    try {
        const jwtRef = process.env.JWT_REFRESH_SECRET || '';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtRef);
        const userId = decoded.userId;
        const storedToken = yield User_1.default.findOne({ userId, refreshToken });
        if (!storedToken) {
            return res.status(403).json({ message: 'Invalid refresh token', status: 403 });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId, email: decoded.email }, process.env.JWT_ACCESS_SECRET || '', { expiresIn: '1h' });
        res.status(200).json({
            message: 'Access token refreshed',
            accessToken: newAccessToken,
            status: 200,
        });
    }
    catch (error) {
        return res.status(401).json({ message: error, status: 401 });
    }
});
exports.refreshAccessToken = refreshAccessToken;
