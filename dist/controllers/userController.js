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
exports.restPassword = exports.verifyOtp = exports.forgotPassword = exports.login = exports.signUp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const generateOtp_1 = require("../utills/generateOtp");
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, mobile, password } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                status: 400
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({
            email,
            mobile,
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(200).json({
            message: "User registered successfully",
            status: 200
        });
    }
    catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
});
exports.signUp = signUp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jwtAccess = process.env.JWT_ACCESS_SECRET || '';
        const jwtRef = process.env.JWT_REFRESH_SECRET || '';
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                status: 400,
            });
        }
        ;
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials",
                status: 400,
            });
        }
        ;
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, jwtAccess, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, jwtRef, { expiresIn: '30d' });
        user.refreshToken = refreshToken;
        yield user.save();
        return res.status(200).json({
            message: "Login successful",
            data: {
                userId: user.userId,
                accessToken,
                refreshToken,
            },
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({
                message: "User not found",
                status: 400
            });
        const otp = (0, generateOtp_1.generateOTP)();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        yield user.save();
        yield (0, generateOtp_1.sendEmail)(user.email, "Password Reset OTP", `Your OTP is: ${otp}. It is valid for 10 minutes.`);
        return res.json({
            message: "OTP sent to email",
            status: 200
        });
    }
    catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const userData = yield User_1.default.findOne({ email });
        if (!userData || userData.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP. Please use valid OTP.",
                status: 400
            });
        }
        if (!userData || new Date() > new Date(userData.otpExpiry)) {
            return res.status(400).json({
                message: "Your OTP has expired.",
                status: 400
            });
        }
        userData.otp = undefined;
        userData.otpExpiry = undefined;
        yield userData.save();
        const resetToken = (0, generateOtp_1.generateResetToken)(userData.userId);
        return res.status(200).json({
            message: "OTP verified successfully",
            status: 200,
            resetToken: resetToken
        });
    }
    catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
});
exports.verifyOtp = verifyOtp;
const restPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword } = req.body;
        const userId = req.user;
        const userData = yield User_1.default.findOne({ userId });
        if (!userData) {
            return res.status(404).json({
                message: "User not found",
                status: 404
            });
        }
        userData.password = yield bcryptjs_1.default.hash(newPassword, 10);
        yield userData.save();
        return res.status(200).json({
            messages: "Password reset successful",
            status: 200
        });
    }
    catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
});
exports.restPassword = restPassword;
