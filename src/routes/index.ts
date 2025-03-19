import express, { Application } from "express";
import adminRoutes from "./adminAuthRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import subcategoryRoutes from "./subcategoryRoutes";

const router = express.Router();

router.use("/api/admin",adminRoutes)
router.use("/api/users", userRoutes);
router.use("/api/category", categoryRoutes);
router.use("/api/subcategory", subcategoryRoutes);


export default router;