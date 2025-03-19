import { Request, Response } from "express";
import Category from "../models/Category";
import Subcategory from "../models/Subcategory";
import { translateText } from '../utills/translateService'

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

        const nameFr = await translateText(name, "fr");

        const category = new Category({
            name:{
                en: name,
                fr: nameFr
            },
            slug: slug ? slug : name,
        });

        await category.save();

        return res.status(200).json({
            message: "Category inserted successfully",
            status: 200,
            data: category
        })

    } catch (error) {
        return res.status(500).json({
            messages: error,
            status: 500
        });
    }
};

// to get category
// const getCategories = async (req: Request, res: Response) => {
//     try{
//         const categories = await Category.find();

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Categories fetched successfully!",
//             data: categories
//         });
//     }
//     catch(error){
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             message: "Inernal server error!",
//             error: error
//         });
//     }
// };
const getCategories = async (req: Request, res: Response) => {
    try {
      const { lang } = req.query as { lang?: string };
      const categories = await Category.find({isActive: true});
  
      const translatedCategories = categories.map((cat) => ({
        id: cat._id,
        name: cat.name[lang as keyof typeof cat.name] || cat.name.en,
        categoryId: cat.categoryId
      }));
  
      res.status(200).json({
        success: true,
        status: 200,
        message: "Categories fetched successfully!",
        data: translatedCategories
    });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  };
  

// delete categories
const deleteCategory = async(req: Request, res: Response) => {
    try{
        const categoryId = req.params.categoryId;

        const category = await Category.findOneAndDelete({categoryId});

        // Delete the subcategories also
        await Subcategory.deleteMany({ categoryId });   

        // delete Subsubcategory 
        // await SubSubcategory.deleteMany({ categoryId }); 
        
        // delete products
        // await Product.deleteMany({ categoryId });   


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
};

// update active - block status of the category
const activeBlockCategory = async(req: Request, res: Response) => {
    try{
        const { id } = req.params

        const category = await Category.findOne({categoryId: id});

        if(!category){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Category not found!",
            });
        }
        // Toggle the isActive field
        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: `category ${category.isActive ? "activated" : "deactivated"} successfully!`
        })
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

// get categories for admin
const getCategoriesForAdmin = async(req: Request, res: Response) => {
    try{
        const categories = await Category.find().lean();

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
            message: "Internal seerver error!",
            error: error
        });
    }
};


export {
    insertCategory,
    getCategories,
    deleteCategory,
    updateCategory,
    activeBlockCategory,
    getCategoriesForAdmin
}
