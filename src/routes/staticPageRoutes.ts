import {Router} from "express";

import {
    getStaticPage,
    updateStaticPage,
    downloadStaticPageAsPDF,
    downloadPdfsAsZip
} from "../controllers/StaticPageController";

const router = Router();

router.get("/get/:slug", getStaticPage);
router.post("/update/:slug", updateStaticPage);
router.get("/download-pdf/:slug", downloadStaticPageAsPDF);
router.get('/download-documents', downloadPdfsAsZip);




export default router;