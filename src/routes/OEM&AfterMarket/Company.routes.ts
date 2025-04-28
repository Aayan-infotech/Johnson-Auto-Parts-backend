import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompanyById,
} from "../../controllers/OEM&AfterMarket/VehicleCompany.Controller";

const router = Router();

router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.delete("/:id", deleteCompanyById);

export default router;
