import express from "express";
import { addReview, getReviews, getAllReviewsWithUserDetails, getAllReviews, deleteReview } from "../../controllers/Reviews/ratingAndReviews";

const router = express.Router();

router.post("/:productId/review", addReview); // Add a review to a product
router.get("/:productId/review", getReviews); // Get all reviews of a product
router.get("/get-all-reviews", getAllReviewsWithUserDetails); // Get average rating of a product


// admin routes
router.get("/admin/get-all", getAllReviews);
router.delete("/admin/delete/:reviewId", deleteReview);

export default router;
