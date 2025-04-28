import { Request, Response } from "express";
import CompanyModel from "../../models/OEM&AfterMarket/VehicleCompany"; // Adjust path as needed
import ModelModal from "../../models/OEM&AfterMarket/VehicleModel.Model"; // Adjust path as needed

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.body;
    const newCompany = await CompanyModel.create({ companyName });
    res.status(201).json({
      message: "Company Created Successfully",
      success: true,
      data: newCompany,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await CompanyModel.find().select("-models");
    res
      .status(200)
      .json({
        message: "Companies Fetched successfully",
        success: true,
        data: companies,
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await CompanyModel.findById(id).populate("models");
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First delete all models that belong to this company
    await ModelModal.deleteMany({ company: id });

    // Then delete the company itself
    const company = await CompanyModel.findByIdAndDelete(id);

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    res.status(200).json({ success: true, message: "Company and its relevant models deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
