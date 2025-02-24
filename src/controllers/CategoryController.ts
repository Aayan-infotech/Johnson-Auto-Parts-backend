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
};

// to get category
const getCategories = async (req: Request, res: Response) => {
    try{
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            status: 200,
            message: "Categories fetched successfully!",
            data: categories
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Inernal server error!",
            error: error
        });
    }
};

// delete categories
const deleteCategory = async(req: Request, res: Response) => {
    try{
        const categoryId = req.params.categoryId;

        const category = await Category.findOneAndDelete({categoryId});
        if(!category){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Category not found!"
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "Category deleted successfully!"
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error!",
            error: error
        });
    }
};

// update categories
const updateCategory = async(req: Request, res: Response) => {
    try{
        const categoryId = req.params.categoryId;
        const name = req.body.name

        const category = await Category.findOne({categoryId});
        if(!category){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Category not found!"
            });
        }

        category.name = name || category.name;

        await category.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "Category updated successfully!",
            data: category
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error!",
            error: error
        });
    }
}

export {
    insertCategory,
    getCategories,
    deleteCategory,
    updateCategory
}
