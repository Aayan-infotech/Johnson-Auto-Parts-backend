import { Router, Request, Response } from "express";
import { signUp, login ,forgotPassword,verifyOtp,restPassword,getAllUsers, blockUnblockUser,getUserDetails,updateUser} from "../controllers/userController";
import { verifyAccessToken ,refreshAccessToken} from "../middleware/authMiddleware";
import { uploadToS3 } from "../middleware/s3Upload";

const router = Router();

router.post("/login", login);
router.post("/signUp", signUp);
router.post("/refreshToken", refreshAccessToken);
router.post("/forgot-password",forgotPassword);
router.post("/verifyOtp",verifyOtp);
router.post("/resetPass",verifyAccessToken,restPassword);
router.get("/getAllUsers", getAllUsers);
router.get("/getUserDetails", verifyAccessToken,getUserDetails);
router.put("/updateUser", verifyAccessToken,uploadToS3,updateUser);
router.put("/admin/blockUnblockUser/:userId", blockUnblockUser);



export default router;