import express from "express";
import {
    createRegularServiceCategory,
  getAllRegularServices,
  getRegularServiceById,
  updateRegularService,
  deleteRegularService,
} from "../controllers/RegularServiceControllers";
import { uploadToS3 } from "../middleware/s3Upload";

const router = express.Router();

router.post("/",uploadToS3, createRegularServiceCategory);
router.get("/", getAllRegularServices);
router.get("/:id", getRegularServiceById);
router.put("/:id",uploadToS3, updateRegularService);
router.delete("/:id", deleteRegularService);

export default router;
