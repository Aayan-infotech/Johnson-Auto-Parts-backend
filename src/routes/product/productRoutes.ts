import { Router, Request, Response } from "express";
import {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct,getProductBySubCategoryOrSubSubCategory, getProductByQuery, getProductByautoPartType} from "../../controllers/product/ProductController";
import { uploadToS3 } from "../../middleware/s3Upload";

const router = Router();



router.post('/admin/create-product',uploadToS3, createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.get('/getProductBySubCategoryOrSubSubCategory/:id', getProductBySubCategoryOrSubSubCategory);
router.put('/update-product/:productId',uploadToS3, updateProduct);
router.delete('/delete-product/:id', deleteProduct);
router.get('/auto-part-type', getProductByautoPartType);
router.get('/', getProductByQuery);

export default router;