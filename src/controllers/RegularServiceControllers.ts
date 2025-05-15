import { Request, Response } from "express";
import RegularService from "../models/RegularServiceCategoryModel";
import { translateText } from "../utills/translateService"; // Ensure this exists and works like in createProduct

interface AuthRequest extends Request {
  fileLocations?: string[];
}

// CREATE
export const createRegularServiceCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description, categoryDiscount } = req.body;
    const image = req.fileLocations?.[0] ?? "";

    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Description are required" });
    }

    // Translate fields to French
    const nameFr = await translateText(name, "fr");
    const descriptionFr = await translateText(description, "fr");

    const newCategory = {
      name: { en: name, fr: nameFr },
      description: { en: description, fr: descriptionFr },
      image,
      categoryDiscount: categoryDiscount ? Number(categoryDiscount) : 0,
    };

    const createdCategory = await RegularService.create(newCategory);

    return res.status(201).json({
      success: true,
      message: "Regular service category created successfully",
      data: createdCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating regular service category",
      error: (error as Error).message,
    });
  }
};

// GET ALL
export const getAllRegularServices = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: "en" | "fr" };
    const services = await RegularService.find();

    const translated = services.map((service) => ({
      ...service.toObject(),
      name: service.name?.[lang ?? "en"] ?? service.name.en,
      description:
        service.description?.[lang ?? "en"] ?? service.description.en,
    }));

    res.status(200).json({ success: true, data: translated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch services" });
  }
};

// GET BY ID
export const getRegularServiceById = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query as { lang?: "en" | "fr" };
    const service = await RegularService.findById(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, error: "Not found" });

    const translated = {
      ...service.toObject(),
      name: service.name?.[lang ?? "en"] ?? service.name.en,
      description:
        service.description?.[lang ?? "en"] ?? service.description.en,
    };

    res.status(200).json({ success: true, data: translated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching service" });
  }
};

// UPDATE
export const updateRegularService = async (req: AuthRequest, res: Response) => {
  try {
    const service = await RegularService.findById(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, error: "Not found" });
    const image = req.fileLocations?.[0] ?? "";
    const { name, description, categoryDiscount } = req.body;

    if (name) {
      service.name.en = name;
      service.name.fr = await translateText(name, "fr");
    }

    if (description) {
      service.description.en = description;
      service.description.fr = await translateText(description, "fr");
    }

    if (typeof categoryDiscount !== "undefined") {
      service.categoryDiscount = Number(categoryDiscount);
    }

    if (image) {
      service.image = image;
    }

    const updated = await service.save();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Update failed" });
  }
};

// DELETE
export const deleteRegularService = async (req: Request, res: Response) => {
  try {
    const service = await RegularService.findByIdAndDelete(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Deletion failed" });
  }
};
