import { Request, Response } from "express";
import Category from "../models/Category";

const insertCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug } = req.body;

        const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] }).exec();

        if (existingCategory) {
            return res.status(400).json({
                message: "Category with this name or slug already exists",
                status: 400,
            });
        }

        const category = new Category({
            name,
            slug,
        });

        await category.save();

        return res.status(200).json({
            message: "Category inserted successfully",
            status: 200
        })

    } catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
}

export {
    insertCategory
}
