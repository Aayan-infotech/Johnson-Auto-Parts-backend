import { Request, Response } from "express";
import VehicleModel from "../../models/OEM&AfterMarket/VehicleModel.Model"; // Adjust path as needed
import CompanyModel from "../../models/OEM&AfterMarket/VehicleCompany"; // Adjust path as needed

interface ModelRequest extends Request {
  fileLocations?: string[]; // Adjust the type as needed
}

export const createModel = async (req: ModelRequest, res: Response) => {
  try {
    const { modelName, company } = req.body;
    const modelImage = req.fileLocations;

    const newModel = await VehicleModel.create({
      modelName,
      company,
      modelImage,
    });

    await CompanyModel.findByIdAndUpdate(
      company,
      { $push: { models: newModel._id } },
      { new: true } 
    );

    res.status(201).json({ success: true, data: newModel });
  } catch (error: any) {
    console.error("Error creating model:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllModelsOfCompany = async (req: Request, res: Response) => {
  try {
    const {companyId} = req.params;
    const models = await VehicleModel.find({ company: companyId });
    res
      .status(200)
      .json({
        success: true,
        message: "All the model of this Company Fetched successfully",
        data: models,
      });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await VehicleModel.findById(id);
    if (!model) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found" });
    }
    res.status(200).json({ success: true, data: model });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateModel = async (req: ModelRequest, res: Response) => {
  try {
    const { modelName, company } = req.body;
    const modelImage = req.fileLocations;
    const modelId = req.params.id;

    const updateData: any = {};

    if (modelName) updateData.modelName = modelName;
    if (modelImage) updateData.modelImage = modelImage;

    const updatedModel = await VehicleModel.findByIdAndUpdate(
      modelId,
      updateData,
      { new: true } 
    );

    if (company) {
      await CompanyModel.findByIdAndUpdate(
        company,
        { $addToSet: { models: updatedModel?._id } }, 
        { new: true }
      );
    }

    res.status(200).json({ success: true, data: updatedModel });
  } catch (error: any) {
    console.error("Error updating model:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

