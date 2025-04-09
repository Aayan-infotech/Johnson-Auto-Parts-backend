import {Router} from "express";

import {
    getStaticPage,
    updateStaticPage
} from "../controllers/StaticPageController";

const router = Router();

router.get("/get/:key", getStaticPage);
router.put("/update/:key", updateStaticPage);

export default router;