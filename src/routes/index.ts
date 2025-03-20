import express, { Application } from "express";
import adminRoutes from "./adminAuthRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import subcategoryRoutes from "./subcategoryRoutes";
import subsubcategoryRoutes from "./subSubcategoryRoutes";

const router = express.Router();

router.use("/api/admin",adminRoutes)
router.use("/api/users", userRoutes);
router.use("/api/category", categoryRoutes);
router.use("/api/subcategory", subcategoryRoutes);
router.use("/api/subsubcategory", subsubcategoryRoutes);


export default router;