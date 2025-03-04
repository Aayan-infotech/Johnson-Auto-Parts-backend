import { Router, Request, Response } from "express";
import {
    insertCategory,
    getCategories,
    deleteCategory,
    updateCategory
}from "../controllers/CategoryController";
import { verifyAccessToken } from "../middleware/authMiddleware"

const router = Router();

router.post('/insert', verifyAccessToken, insertCategory);
// router.post('/insert', (req:Request,res:Response)=>{
//     console.log("into req")
// });

router.get('/get-category', getCategories);
router.delete('/delete-category/:categoryId', verifyAccessToken, deleteCategory);
router.put('/update-category/:categoryId', verifyAccessToken, updateCategory);

export default router;