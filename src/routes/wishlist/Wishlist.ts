import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, clearWishlist } from "../../controllers/wishlist/wishlistController";

const router = express.Router();

router.post("/add", addToWishlist);
router.get("/", getWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.delete("/clear", clearWishlist);

export default router;
