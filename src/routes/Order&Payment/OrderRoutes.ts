import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderByUserId,
    changeOrderStatus,
    trackOwnOrderStatus,
} from "../../controllers/order/OrderController";

import { verifyAccessToken } from "../../middleware/authMiddleware";

const router = Router();

router.post("/create-order",verifyAccessToken, createOrder);
router.get("/user/get-orders/:userId", getOrderByUserId);
router.get("/order-status/:orderId", trackOwnOrderStatus);

// admin
router.get("/admin/get-orders", getOrders);
router.patch("/admin/change-order/:orderId", changeOrderStatus);


export default router;