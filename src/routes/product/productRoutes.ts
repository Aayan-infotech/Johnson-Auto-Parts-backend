import { Router, Request, Response } from "express";
import {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct,getProductBySubCategoryOrSubSubCategory} from "../../controllers/product/ProductController";

const router = Router();



router.post('/create-product', createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.get('/getProductBySubCategoryOrSubSubCategory/:id', getProductBySubCategoryOrSubSubCategory);
router.put('/update-product/:productId', updateProduct);
router.delete('/delete-product/:id', deleteProduct);

export default router;