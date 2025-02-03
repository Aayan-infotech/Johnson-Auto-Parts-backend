import { Router, Request, Response } from "express";
import { signUp, login ,forgotPassword,verifyOtp,restPassword} from "../controllers/userController";
import { verifyAccessToken ,refreshAccessToken} from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signUp", signUp);
router.post("/refreshToken", refreshAccessToken);
router.post("/forgate",forgotPassword);
router.post("/verifyOtp",verifyOtp);
router.post("/resetPass",verifyAccessToken,restPassword)


export default router;