import { Request, Response } from "express";
import Review from "../../models/RatingAndReviews";
import Product from "../../models/ProductModel";
import { translateText } from "../../utills/translateService";

// Add a review to a product
export const addReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const commentFr = await translateText(comment, "fr");

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create a new review
    const review = new Review({ productId, userId, rating, comment: { en: comment, fr: commentFr } });
    await review.save();

    res.status(200).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(404).json({ message: "Server error", error });
  }
};
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).populate("productId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(404).json({ message: "Server error", error });
  }
};

export const getAllReviewsWithUserDetails = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: string };
    const reviews = await Review.find()
      .populate("userId", "name profilePicture")
      .populate("productId", "name")
      .sort({ createdAt: -1 }).limit(10);

      const translatedReviews = reviews.map((review) => ({
      id: review._id,
      comment: review.comment[lang as keyof typeof review.comment] || review.comment.en,
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
      createdAt: review.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: translatedReviews,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "Server error", error });
  }
};
export const getTopReviewsUserDetails = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name profilePicture")
      .populate("productId", "name")
      .sort({ createdAt: -1 }).limit(10);
      console.log(reviews.map(r => r.userId));
    res
      .status(200)
      .json({
        success: true,
        message: "Reviews fetched successfully",
        data: reviews,
      });
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
          reviews: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.name",
          averageRating: { $round: ["$averageRating", 1] },
          reviews: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(404).json({ success: false, message: "Server error", error });
  }
};

// admin apis
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().populate('userId', 'name').lean();

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "No feedbacks found!"
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Feedbacks fetched successfully!",
      data: reviews
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error
    });
  }
};

// delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Review not found!"
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Feedback deleted successfully!",
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error!",
      error: error
    });
  }
};