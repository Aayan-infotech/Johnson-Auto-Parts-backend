import express from "express";
import { addReview, getReviews, getAllReviewsWithUserDetails, getAllReviewsWithAverage, getTopReviewsUserDetails, getAllReviews, deleteReview } from "../../controllers/Reviews/ratingAndReviews";

const router = express.Router();

router.post("/:productId/review", addReview);
router.get("/:productId/review", getReviews);
router.get("/get-all-reviews", getAllReviewsWithUserDetails); 
router.get("/get-top-reviews", getTopReviewsUserDetails); 
router.get("/get-avgRating-reviews", getAllReviewsWithAverage); 

// admin routes
router.get("/admin/get-all", getAllReviews);
router.delete("/admin/delete/:reviewId", deleteReview);

export default router;
