import { Router, Request, Response } from "express";
import {
    AddSubcategory,
    getSubcategoryByCategory,
    deleteSubcategory,
    getSubcategoryForAdmin,
    activateDeactivateSubcategory
} from "../controllers/subcategoryController";
import { uploadToS3 } from "../middleware/s3Upload";

const router = Router();

router.get('/get-subcategories/:categoryId', getSubcategoryByCategory);

// for admin
router.get('/admin/get-all-subcategories', getSubcategoryForAdmin);
router.post('/admin/add-subcategory',uploadToS3, AddSubcategory);
router.delete('/admin/delete-subcategory/:id', deleteSubcategory);
router.put('/admin/activate-subcategory/:id', activateDeactivateSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);




export default router;