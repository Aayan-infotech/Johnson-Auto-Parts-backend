import express, { Application } from "express";
import adminRoutes from "./adminAuthRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import subcategoryRoutes from "./subcategoryRoutes";
import subsubcategoryRoutes from "./subSubcategoryRoutes";
import productRoutes from "./product/productRoutes";
import RatingAndReviews from "./RatingAndReviews/RatingAndReviews";
import cartRoutes from "./Cart/CartRoutes";
import orderRoutes from "./Order&Payment/OrderRoutes";
import wishListRoutes from "./wishlist/Wishlist";


const router = express.Router();

router.use("/api/admin",adminRoutes)
router.use("/api/users", userRoutes);
router.use("/api/category", categoryRoutes);
router.use("/api/subcategory", subcategoryRoutes);
router.use("/api/subsubcategory", subsubcategoryRoutes);
router.use("/api/product", productRoutes);
router.use("/api/RatingAndReviews", RatingAndReviews);
router.use("/api/orders", orderRoutes);
router.use("/api/cart",cartRoutes);
router.use("/api/wishlist",wishListRoutes);



export default router;