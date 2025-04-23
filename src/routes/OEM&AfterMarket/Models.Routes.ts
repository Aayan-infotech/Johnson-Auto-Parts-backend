import { Router } from "express";
import {
  createModel,
  getAllModelsOfCompany,
  getModelById,
} from "../../controllers/OEM&AfterMarket/VehicleModel.Controller";
import { uploadToS3 } from "../../middleware/s3Upload";

const router = Router();

router.post("/create-model", uploadToS3 ,createModel);
router.get("/model/:companyId", getAllModelsOfCompany);
router.get("/:id", getModelById);

export default router;
