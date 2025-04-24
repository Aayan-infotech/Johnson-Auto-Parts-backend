import {Router} from "express";

import {
    getStaticPage,
    updateStaticPage
} from "../controllers/StaticPageController";

const router = Router();

router.get("/get/:slug", getStaticPage);
router.post("/update/:slug", updateStaticPage);

export default router;