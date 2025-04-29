import {Router, Response, Request} from "express";
import {addFaq, getFaq, deleteFaq} from "../../controllers/FAQ/FaqController";

const router = Router();


// admin routes
router.post("/admin/create-faq", addFaq);
router.get("/admin/get-faq", getFaq);
router.delete("/admin/delete-faq/:faqId", deleteFaq);

export default router;