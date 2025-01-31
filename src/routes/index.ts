import express, { Application } from "express";
import userRoutes from "./userRoutes";

const router = express.Router();

router.use("/api/users", userRoutes);


export default router;