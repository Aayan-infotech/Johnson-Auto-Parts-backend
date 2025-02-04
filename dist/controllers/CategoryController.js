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
exports.insertCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const insertCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, slug } = req.body;
        const existingCategory = yield Category_1.default.findOne({ $or: [{ name }, { slug }] }).exec();
        if (existingCategory) {
            return res.status(400).json({
                message: "Category with this name or slug already exists",
                status: 400,
            });
        }
        const category = new Category_1.default({
            name,
            slug,
        });
        yield category.save();
        return res.status(200).json({
            message: "Category inserted successfully",
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
exports.insertCategory = insertCategory;
