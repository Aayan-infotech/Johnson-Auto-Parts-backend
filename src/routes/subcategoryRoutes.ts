import { Router, Request, Response } from "express";
import {
    AddSubcategory,
    getSubcategoryByCategory,
    deleteSubcategory,
    getSubcategoryForAdmin
} from "../controllers/subcategoryController";

const router = Router();

router.get('/get-subcategories/:categoryId', getSubcategoryByCategory);

// for admin
router.get('/admin/get-all-subcategories', getSubcategoryForAdmin);
router.post('/admin/add-subcategory', AddSubcategory);
router.delete('/admin/delete-subcategory/:id', deleteSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);




export default router;