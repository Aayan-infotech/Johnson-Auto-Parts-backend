import { Router, Request, Response } from "express";
import {
    insertsubSubcategory,
    getSubSubcategoryBySubcategoryId,
    getAllSubSubcategories
} from "../controllers/subSubcategoryController";

const router = Router();

router.get('/get-subsubcategories/:subcategoryId', getSubSubcategoryBySubcategoryId);

// for admin
router.get('/admin/get-all-subsubcategories', getAllSubSubcategories);
router.post('/admin/insert-subsubcategory', insertsubSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);




export default router;