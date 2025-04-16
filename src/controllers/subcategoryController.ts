import { Request, Response } from "express";
import Subcategory from "../models/Subcategory";
import { translateText } from '../utills/translateService'
import SubSubcategory from "../models/SubSubcategory";

// add subcategory
const AddSubcategory = async (req: Request, res: Response) => {
    try {
        const {
            categoryId,
            name,
            slug
        } = req.body;

        const existingSubcategory = await Subcategory.findOne({ name: name, categoryId: categoryId });
        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Subcategory already exists!"
            });
        }

        const nameFr = await translateText(name, "fr");


        const newSubcategory = new Subcategory({
            categoryId,
            name: {
                en: name,
                fr: nameFr
            },
            slug: slug ? slug : name,
        });

        await newSubcategory.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "Subcategory Added successfully!"
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "Internal server error!",
            error: error
        });
    }
};

// getsubcategory on the basis of category 
const getSubcategoryByCategory = async (req: Request, res: Response) => {
    try {
        const {lang} = req.query as { lang?: string }; 
        const { categoryId } = req.params;

        const subcategories = await Subcategory.find({isActive: true, categoryId: categoryId });

        const translatedSubcategories = subcategories.map((cat)=> ({
            id: cat._id,
            name: cat.name[lang as keyof typeof cat.name] || cat.name.en,
            categoryId: cat.categoryId,
        }))
        if(subcategories.length === 0){
            return res.status(200).json({
                success: false,
                status: 200,
                message: "No subcategory found!",
                data: translatedSubcategories
            })
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "Subcategory fetched successfully!",
            data: translatedSubcategories
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "Internal server error!",
            error: error
        });
    }
};

// delete category
const deleteSubcategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const subcategory = await Subcategory.findOneAndDelete({ _id: id });
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Subcategory not found!"
            });
        }

        // delete subsubcategories
        // await SubSubcategory.deleteMany({ id });

        // delete products
        // await Product.deleteMany({ id });

        res.status(200).json({
            success: false,
            status: 200,
            message: "Subcategory deleted successfully!",
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            sttaus: 404,
            message: "Internal server error!",
            error: error,
        });
    }
};

// get subcategory for admin
const getSubcategoryForAdmin = async (req: Request, res: Response) => {
    try {
        const subcategories = await Subcategory.find().lean();

        if (subcategories.length === 0) {
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Subcategory fetched successfully!",
                data: subcategories
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "Subcategories fetched successfully!",
            data: subcategories
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            sttaus: 404,
            message: "Internal server error!",
            error: error,
        });
    }
};

// activate-deactivatae subcategory
const activateDeactivateSubcategory = async(req: Request, res: Response) => {
    try{
        const id = req.params.id;

        const subcategory = await Subcategory.findOne({_id: id});

        if(!subcategory){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Subcategory not found!"
            });
        }

        subcategory.isActive = !subcategory.isActive;
        await subcategory.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: `Subcategory ${subcategory.isActive ? "Activated" : "Deactivated"} successfully!`, 
        })
    }
    catch(error){
        return res.status(404).json({
            success: false,
            status: 404,
            message: "Internal server error!",
            error: error
        });
    }
};




export {
    AddSubcategory,
    getSubcategoryByCategory,
    deleteSubcategory,
    getSubcategoryForAdmin,
    activateDeactivateSubcategory
}