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
import staticPageRoutes from "./staticPageRoutes"
import regualrServiceRoutes from "./regualrServiceRoutes"
import companyRoutes from "./OEM&AfterMarket/Company.routes"
import modelRoutes from "./OEM&AfterMarket/Models.Routes"
import partVideoRoutes from "./partsVideo.Routes"
import faqRoutes from "./FAQ/FaqRoutes";
import contactRoutes from "./ContactUS/ContactUsRoutes";
import translateRoute from "./translateRoutes";
import addressRoute from "./AddressRoutes";


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
router.use("/api/static-page", staticPageRoutes);
router.use("/api/regular-services", regualrServiceRoutes);
router.use("/api/companies", companyRoutes);
router.use("/api/models", modelRoutes);
router.use("/api/part-video", partVideoRoutes);
router.use("/api/faq", faqRoutes);
router.use("/api/contact-us", contactRoutes);
router.use("/api/translate", translateRoute);
router.use("/api/address", addressRoute);


export default router;