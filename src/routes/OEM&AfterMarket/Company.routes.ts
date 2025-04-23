import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
} from "../../controllers/OEM&AfterMarket/VehicleCompany.Controller";

const router = Router();

router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);

export default router;
