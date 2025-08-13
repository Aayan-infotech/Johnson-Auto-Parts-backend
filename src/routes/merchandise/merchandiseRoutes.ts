import express from "express";
import {
  createMerchandiseProduct,
  getAllMerchandiseProducts,
  getMerchandiseProductById,
  updateMerchandiseProduct,
  deleteMerchandiseProduct,
} from "../../controllers/merchandise/merchandiseProduct";

const router = express.Router();

router.post("/create", createMerchandiseProduct);
router.get("/", getAllMerchandiseProducts);
router.get("/:id", getMerchandiseProductById);
router.put("/:id", updateMerchandiseProduct);
router.delete("/:id", deleteMerchandiseProduct);

export default router;
