import { Router, Request, Response } from "express";
import { signUp, login ,forgotPassword,verifyOtp,restPassword,getAllUsers, blockUnblockUser,getUserDetails,updateUser} from "../controllers/userController";
import { verifyAccessToken ,refreshAccessToken} from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signUp", signUp);
router.post("/refreshToken", refreshAccessToken);
router.post("/forgate",forgotPassword);
router.post("/verifyOtp",verifyOtp);
router.post("/resetPass",verifyAccessToken,restPassword);
router.get("/getAllUsers", getAllUsers);
router.get("/getUserDetails", verifyAccessToken,getUserDetails);
router.put("/updateUser", verifyAccessToken,updateUser);
router.put("/admin/blockUnblockUser/:userId", blockUnblockUser);



export default router;