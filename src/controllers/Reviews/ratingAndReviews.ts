import { Request, Response } from "express";
import Review from "../../models/RatingAndReviews";
import Product from "../../models/ProductModel";

// Add a review to a product
export const addReview = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { userId, rating, comment } = req.body;

        if (!userId || !rating || !comment) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Create a new review
        const review = new Review({ productId, userId, rating, comment });
        await review.save();

        res.status(200).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(404).json({ message: "Server error", error });
    }
};
export const getReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId }).populate("userId", "name image") .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(404).json({ message: "Server error", error });
    }
};

export const getAllReviewsWithUserDetails = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find()
            .populate("userId", "name image") // Populate user name and image
            .populate("productId", "name") // Populate product name
            .sort({ createdAt: -1 }); // Sort by latest reviews

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(404).json({ success: false, message: "Server error", error });
    }
};


export const getAllReviewsWithAverage = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.aggregate([
            {
                $group: {
                    _id: "$productId", 
                    averageRating: { $avg: "$rating" }, 
                    reviews: { $push: "$$ROOT" } 
                }
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" }, 
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$productDetails.name",
                    averageRating: { $round: ["$averageRating", 1] },
                    reviews: 1
                }
            }
        ]);

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(404).json({ success: false, message: "Server error", error });
    }
};

