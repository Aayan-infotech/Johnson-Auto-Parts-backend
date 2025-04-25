import express from "express";
import {
  createPartsVideo,
  getAllPartsVideos,
  updatePartsVideo,
  deletePartsVideo,
} from "../controllers/PartsVideo";
import { uploadToS3 } from "../middleware/s3Upload";

const router = express.Router();

router.post("/", uploadToS3,createPartsVideo);

router.get("/", getAllPartsVideos);

router.put("/:id",uploadToS3, updatePartsVideo);

router.delete("/:id", deletePartsVideo);

export default router;
