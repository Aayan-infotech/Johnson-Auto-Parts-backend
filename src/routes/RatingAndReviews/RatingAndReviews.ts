import express from "express";
import { addReview, getReviews, getAllReviewsWithUserDetails, getAllReviewsWithAverage, getTopReviewsUserDetails } from "../../controllers/Reviews/ratingAndReviews";

const router = express.Router();

router.post("/:productId/review", addReview);
router.get("/:productId/review", getReviews);
router.get("/get-all-reviews", getAllReviewsWithUserDetails); 
router.get("/get-top-reviews", getTopReviewsUserDetails); 
router.get("/get-avgRating-reviews", getAllReviewsWithAverage); 

export default router;
