import { Router, Request, Response } from "express";
import { signUp, login ,aabb} from "../controllers/userController";
import { verifyAccessToken ,refreshAccessToken} from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signUp", signUp);
router.post("/refreshToken", refreshAccessToken);
router.get("/get",verifyAccessToken,aabb);


export default router;