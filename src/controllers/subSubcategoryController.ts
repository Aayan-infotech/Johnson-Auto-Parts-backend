import { Request, Response } from "express";
import SubSubcategory from "../models/SubSubcategory";
import { translateText } from "../utills/translateService";
import mongoose from "mongoose";
interface S3Request extends Request {
  fileLocations?: string[]; // Adjust the type as needed
}

const insertsubSubcategory = async (req: S3Request, res: Response) => {
  try {
    const { categoryId, subcategoryId, name, slug } = req.body;
    const image = req.fileLocations || [];

    const existingSubSubcategory = await SubSubcategory.findOne({
      $or: [{ name }, { slug }],
    }).exec();

    if (existingSubSubcategory) {
      return res.status(400).json({
        message: "SubSubcategory with this name or slug already exists",
        status: 400,
      });
    }

    const nameFr = await translateText(name, "fr");

    const subSubcategory = new SubSubcategory({
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      name: {
        en: name,
        fr: nameFr,
      },
      picture: image[0],
      slug: slug ? slug : name,
    });

    await subSubcategory.save();

    return res.status(200).json({
      message: "SubSubcategory inserted successfully",
      status: 200,
      data: subSubcategory,
    });
  } catch (error) {
    return res.status(404).json({
      messages: error,
      status: 404,
    });
  }
};

const getSubSubcategoryBySubcategoryId = async (
  req: S3Request,
  res: Response
) => {
  try {
    const { lang } = req.query as { lang?: string };
    const subcategoryId = req.params.subcategoryId;
    const objectId = new mongoose.Types.ObjectId(subcategoryId);
    const subsubcategories = await SubSubcategory.find({
      isActive: true,
      subcategoryId: objectId,
    }).sort({createdAt:-1});

    const translatedSubSubcategories = subsubcategories.map((cat) => ({
      id: cat._id,
      name: cat.name[lang as keyof typeof cat.name] || cat.name.en,
      categoryId: cat.categoryId,
      image: cat.picture,
      subcategoryId: cat.subcategoryId,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Categories fetched successfully!",
      data: translatedSubSubcategories,
    });
  } catch (error) {
    res.status(404).json({ error: "Failed to fetch categories" });
  }
};

// get subsubcategory on subcategoryId
// const getSubSubcategoryBySubcategoryId = async(req: Request, res: Response) => {
//     try{
//         const subcategoryId = req.params.subcategoryId;

//         const subsubcategories = await SubSubcategory.find({subcategoryId: subcategoryId, isActive: true});

//         if(!subsubcategories || subsubcategories.length === 0){
//             return res.status(200).json({
//                 success: true,
//                 status: 200,
//                 message: "SubSubcategories not found!",
//                 data: subsubcategories
//             });
//         }

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "SubSubcategories fetched successfully!",
//             data: subsubcategories
//         });
//     }
//     catch(error){
//         return res.status(404).json({
//             success: false,
//             status: 404,
//             message: "Internal server error!",
//             error: error
//         });
//     }
// };

// get all subsubcategories
const getAllSubSubcategories = async (req: Request, res: Response) => {
  try {
    const subSubcategories = await SubSubcategory.find().sort({createdAt:-1});

    if (!subSubcategories || subSubcategories.length === 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "No subSubcategories found!",
        data: subSubcategories,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "All subsubcategories fetched!",
      data: subSubcategories,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: "Internal server error!",
      error: error,
    });
  }
};

// active-block subsubcategory
const activeBlockSubSubcategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const subsubcategory = await SubSubcategory.findOne({ _id: id });
    if (!subsubcategory) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Subsubcategory not found!",
      });
    }

    subsubcategory.isActive = !subsubcategory.isActive;
    await subsubcategory.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: `Subsubcategory ${
        subsubcategory.isActive ? "Activated" : "Deactivated"
      } successfully!`,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: "Internal server error!",
      error: error,
    });
  }
};
const deleteSubSubcategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const subsubcategory = await SubSubcategory.findOne({ _id: id });
    if (!subsubcategory) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Subsubcategory not found!",
      });
    }

    subsubcategory.isActive = !subsubcategory.isActive;
    await subsubcategory.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: `Subsubcategory ${
        subsubcategory.isActive ? "Activated" : "Deactivated"
      } successfully!`,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: "Internal server error!",
      error: error,
    });
  }
};

export {
  insertsubSubcategory,
  getSubSubcategoryBySubcategoryId,
  getAllSubSubcategories,
  deleteSubSubcategory,
  activeBlockSubSubcategory,
};
