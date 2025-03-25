import { Request, Response } from "express";
import Product from "../../models/ProductModel";
import Category from "../../models/Category";
import Subcategory from "../../models/Subcategory";
import SubSubcategory from "../../models/SubSubcategory";

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { categoryId, subcategoryId, subsubcategoryId, name, description, price, brand, picture, quantity, isActive } = req.body;

        if (!categoryId || !name || !description || !price?.actualPrice || !brand) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(400).json({ message: "Invalid categoryId. Category does not exist." });
        }

        if (subcategoryId) {
            const subcategoryExists = await Subcategory.findById(subcategoryId);
            if (!subcategoryExists) {
                return res.status(400).json({ message: "Invalid subcategoryId. Subcategory does not exist." });
            }
        }

        if (subsubcategoryId) {
            const subsubcategoryExists = await SubSubcategory.findById(subsubcategoryId);
            if (!subsubcategoryExists) {
                return res.status(400).json({ message: "Invalid subsubcategoryId. Sub-subcategory does not exist." });
            }
        }

        const product = new Product({
            Category: categoryId,
            SubCategory: subcategoryId || "N/A",
            SubSubcategory: subsubcategoryId || "N/A",
            name,
            description,
            price: {
                actualPrice: price.actualPrice,
                discountPercent: price.discountPercent ?? 0,
            },
            brand,
            picture,
            quantity: quantity ?? 0,
            isActive: isActive ?? true,
        });

        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};
export const getProductBySubCategoryOrSubSubCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const subsubcategoryExist=await SubSubcategory.findById(id)
        const subcategoryExist=await Subcategory.findById(id)
        if(subsubcategoryExist){
            const productsData=await Product.find({SubSubcategory:id})
            return res.status(201).json({
                success:true,
                message:`Products with Sub-Sub-Category ${id} fetched successfully`,
                productsData
            })
        }
        else if(subcategoryExist){
            const productsData=await Product.find({SubCategory:id})
            return res.status(201).json({
                success:true,
                message:`Products with Sub-Category ${id} fetched successfully`,
                productsData
            })
        }
        else{
            return res.status(500).json({
                success:false,
                message:"Invalid Id. Please provide a valid sub-categoryId or Sub-SubCategoryId"
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { name, price, discount, quantity, categoryId, subcategoryId, subsubcategoryId } = req.body;

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updateData = {
            name: name ?? existingProduct.name,
            price: {
                actualPrice: price ?? existingProduct.price.actualPrice,
                discountPercent: discount ?? existingProduct.price.discountPercent,
            },
            quantity: quantity ?? existingProduct.quantity,
            Category: categoryId ?? existingProduct.Category,
            SubCategory: subcategoryId ?? existingProduct.SubCategory,
            SubSubcategory: subsubcategoryId ?? existingProduct.SubSubcategory,
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};
