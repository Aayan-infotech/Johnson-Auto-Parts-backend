import {Router, Response, Request} from "express";
import {addFaq} from "../../controllers/FAQ/FaqController";

const router = Router();


// admin routes
router.post("/admin/create-faq", addFaq);

export default router;