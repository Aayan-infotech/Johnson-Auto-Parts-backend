import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompanyById,
  updateCompany,
} from "../../controllers/OEM&AfterMarket/VehicleCompany.Controller";

const router = Router();

router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.put("/:companyId", updateCompany);
router.delete("/:id", deleteCompanyById);

export default router;
