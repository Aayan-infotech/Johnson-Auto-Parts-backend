import { Router, Request, Response } from "express";
import {
    insertCategory,
    getCategories,
    deleteCategory,
    updateCategory,
    activeBlockCategory,
    getCategoriesForAdmin
}from "../controllers/CategoryController";
import { verifyAccessToken } from "../middleware/authMiddleware"
import { uploadToS3 } from "../middleware/s3Upload";

const router = Router();

// router.post('/insert', (req:Request,res:Response)=>{
//     console.log("into req")
// });

router.get('/get-category', getCategories);


// For admin
router.post('/admin/insert',uploadToS3, insertCategory);
router.get('/admin/get-categories', getCategoriesForAdmin);
router.put('/admin/activate-category/:id', activeBlockCategory);
router.put('/admin/update-category/:categoryId', verifyAccessToken, updateCategory);
router.delete('/admin/delete-category/:categoryId', deleteCategory);

export default router;