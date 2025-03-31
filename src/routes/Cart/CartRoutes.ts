import { Router, Request, Response } from "express";
import { addToCart,getCart,updateCart,removeFromCart ,clearCart} from "../../controllers/Cart/Cart.Controller";
import { verifyAccessToken } from "../../middleware/authMiddleware";

const router = Router();

router.post("/add-to-cart", addToCart);
router.get("/get-user-cart", getCart);
router.put("/update-user-cart", updateCart);
router.delete("/remove-cart-item/:productId", removeFromCart,);
router.put("/clear-cart", clearCart,);

export default router;
