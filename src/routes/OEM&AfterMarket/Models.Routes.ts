import { Router } from "express";
import {
  createModel,
  getAllModels,
  getAllModelsOfCompany,
  getModelById,
  updateModel,
} from "../../controllers/OEM&AfterMarket/VehicleModel.Controller";
import { uploadToS3 } from "../../middleware/s3Upload";

const router = Router();

router.post("/create-model", uploadToS3 ,createModel);
router.get("/all-models", getAllModels);
router.get("/model/:companyId", getAllModelsOfCompany);
router.get("/:id", getModelById);
router.put("/model/:id",uploadToS3, updateModel);

export default router;
