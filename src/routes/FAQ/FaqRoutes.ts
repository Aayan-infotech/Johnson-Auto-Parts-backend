import {Router, Response, Request} from "express";
import {addFaq, getFaq, deleteFaq, editFaq} from "../../controllers/FAQ/FaqController";

const router = Router();


// admin routes
router.post("/admin/create-faq", addFaq);
router.get("/admin/get-faq", getFaq);
router.put("/admin/update-faq/faqId", editFaq);
router.delete("/admin/delete-faq/:faqId", deleteFaq);

export default router;