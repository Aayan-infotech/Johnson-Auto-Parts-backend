import { Router, Request, Response } from "express";
import {
    insertsubSubcategory,
    getSubSubcategoryBySubcategoryId,
    getAllSubSubcategories,
    activeBlockSubSubcategory,deleteSubSubcategory
} from "../controllers/subSubcategoryController";
import { uploadToS3 } from "../middleware/s3Upload";

const router = Router();

router.get('/get-subsubcategories/:subcategoryId', getSubSubcategoryBySubcategoryId);

// for admin
router.get('/admin/get-all-subsubcategories', getAllSubSubcategories);
router.post('/admin/insert-subsubcategory',uploadToS3, insertsubSubcategory);
router.put('/admin/activate-subsubcategory/:id', activeBlockSubSubcategory);
router.delete('/admin/delete-subsubcategory/:id', deleteSubSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);




export default router;