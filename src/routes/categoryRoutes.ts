import { Router, Request, Response } from "express";
import {
    insertCategory
}from "../controllers/CategoryController";

const router = Router();

router.post('/inssert',insertCategory);

export default router;