import express from "express";
import { addReview, getReviews, getAllReviewsWithUserDetails } from "../../controllers/Reviews/ratingAndReviews";

const router = express.Router();

router.post("/:productId/review", addReview); // Add a review to a product
router.get("/:productId/review", getReviews); // Get all reviews of a product
router.get("/get-all-reviews", getAllReviewsWithUserDetails); // Get average rating of a product

export default router;
