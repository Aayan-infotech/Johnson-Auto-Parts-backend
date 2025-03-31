import { Router} from "express";
import {createOrder}from "../../controllers/order/OrderController";

import {verifyAccessToken} from "../../middleware/authMiddleware";

const router = Router();

router.post("/create-order", createOrder);


export default router;