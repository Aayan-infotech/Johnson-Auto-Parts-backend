import { Request, Response } from "express";
import Category from "../models/Category";
import Subcategory from "../models/Subcategory";
import SubSubcategory from "../models/SubSubcategory";
import { translateText } from '../utills/translateService';


const insertsubSubcategory = async (req: Request, res: Response) => {
    try {
        const { categoryId, subcategoryId, name, slug } = req.body;

        const existingSubSubcategory = await SubSubcategory.findOne({ $or: [{ name }, { slug }] }).exec();

        if (existingSubSubcategory) {
            return res.status(400).json({
                message: "SubSubcategory with this name or slug already exists",
                status: 400,
            });
        }

        const nameFr = await translateText(name, "fr");

        const subSubcategory = new SubSubcategory({
            categoryId: categoryId, 
            subcategoryId: subcategoryId,
            name:{
                en: name,
                fr: nameFr
            },
            slug: slug ? slug : name,
        });

        await subSubcategory.save();

        return res.status(200).json({
            message: "SubSubcategory inserted successfully",
            status: 200,
            data: subSubcategory
        })

    } catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
};

// get subsubcategory on subcategoryId
const getSubSubcategoryBySubcategoryId = async(req: Request, res: Response) => {
    try{
        const subcategoryId = req.params.subcategoryId;

        const subsubcategories = await SubSubcategory.find({subcategoryId: subcategoryId, isActive: true});

        if(!subsubcategories || subsubcategories.length === 0){
            return res.status(200).json({
                success: true,
                status: 200,
                message: "SubSubcategories not found!",
                data: subsubcategories
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "SubSubcategories fetched successfully!",
            data: subsubcategories
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

// get all subsubcategories
const getAllSubSubcategories = async(req: Request, res: Response) => {
    try{
        const subSubcategories = await SubSubcategory.find();

        if(!subSubcategories || subSubcategories.length === 0){
            return res.status(200).json({
                success: true,
                status: 200,
                message: "No subSubcategories found!",
                data: subSubcategories
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "All subsubcategories fetched!",
            data: subSubcategories
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

export {
    insertsubSubcategory,
    getSubSubcategoryBySubcategoryId,
    getAllSubSubcategories
}