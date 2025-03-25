import { Router, Request, Response } from "express";
import {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct,getProductBySubCategoryOrSubSubCategory} from "../../controllers/product/ProductController";

const router = Router();



router.post('/create-product', createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.get('/getProductBySubCategoryOrSubSubCategory/:id', getProductBySubCategoryOrSubSubCategory);
router.put('/updateProduct/:productId', updateProduct);
router.delete('/deleteProduct/:id', deleteProduct);

export default router;