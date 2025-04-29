import { Request, Response } from "express";
import PartsVideo from "../models/PartsVideo.model";

interface PartsRequest extends Request {
  fileLocations?: string[]; // Adjust the type as needed
}

export const createPartsVideo = async (req: PartsRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!req.fileLocations || req.fileLocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }
    const videoUrl = req.fileLocations[0];

    const newVideo = await PartsVideo.create({ videoUrl, title, description });

    res
      .status(201)
      .json({ success: true, message: "Video created", video: newVideo });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create video", error });
  }
};

export const getAllPartsVideos = async (req: Request, res: Response) => {
  try {
    const videos = await PartsVideo.find().sort({ createdAt: -1 });

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Video Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching videos",
      error: (error as Error).message,
    });
  }
};

export const updatePartsVideo = async (req: PartsRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    let videoUrl;
    if (req.fileLocations && req.fileLocations.length === 0) {
         videoUrl = req.fileLocations[0];
    }
    
    const updated = await PartsVideo.findByIdAndUpdate(
      id,
      { videoUrl, title, description },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Video updated", video: updated });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update video", error });
  }
};

export const deletePartsVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await PartsVideo.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res.status(200).json({ success: true, message: "Video deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete video", error });
  }
};
