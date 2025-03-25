import { Request, Response } from "express";
import Product from "../../models/ProductModel";
import SubSubcategory from "../../models/SubSubcategory"; 

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { subsubcategoryId, name, description, price, brand, picture, quantity, isActive } = req.body;
            console.log(req.body)
        // Check if sub-subcategory exists
        const subsubcategoryExists = await SubSubcategory.findById(subsubcategoryId);
        if (!subsubcategoryExists) {
            return res.status(400).json({ message: "Invalid subsubcategoryId. Sub-subcategory does not exist." });
        }

        // Create a new product
        const product = new Product({
            SubSubcategory:subsubcategoryId,
            name,
            description,
            price,
            brand,
            picture,
            quantity,
            isActive
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

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { name, price, discount, stock } = req.body;

        // Fetch existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Assign new values while keeping existing structure
        const updateData = {
            name: name ?? existingProduct.name,
            price: {
                actualPrice: price ?? existingProduct.price.actualPrice,
                discountPercent: discount ?? existingProduct.price.discountPercent,
            },
            quantity: stock ?? existingProduct.quantity,
        };

        console.log("Updated Data to be saved:", updateData);

        // Update the product
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
