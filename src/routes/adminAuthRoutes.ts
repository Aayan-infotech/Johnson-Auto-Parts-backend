import { Router} from "express";
import {
    login,
    changeAdminPass
}from "../admin/adminAuth";

import {verifyAdminToken} from "../admin/adminMiddleware";

const router = Router();

router.post("/login", login);
router.post("/changeAdminPass",verifyAdminToken, changeAdminPass);


export default router;