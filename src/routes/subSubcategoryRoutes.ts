import { Router, Request, Response } from "express";
import {
    insertsubSubcategory,
    getSubSubcategoryBySubcategoryId
} from "../controllers/subSubcategoryController";

const router = Router();

router.get('/get-subsubcategories/:subcategoryId', getSubSubcategoryBySubcategoryId);

// for admin
// router.get('/admin/get-all-subcategories', getSubcategoryForAdmin);
router.post('/admin/insert-subsubcategory', insertsubSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);
// router.delete('/admin/delete-subcategory/:id', deleteSubcategory);




export default router;