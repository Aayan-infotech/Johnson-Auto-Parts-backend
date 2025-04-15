import { Response, Request } from 'express';
import StaticPage from "../models/StaticPage";

// get static page
const getStaticPage = async (req: Request, res: Response) => {
    try {
        const key = req.params.slug;

        const content = await StaticPage.findOne({ key });

        if (!content) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Page not found!"
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "Page content fetched successfully!",
            data: content
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error!",
            error: error
        });
    }
};

// update Static page
const updateStaticPage = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug;
        const {key, content} = req.body;

        const updated = await StaticPage.findOneAndUpdate({ slug }, { slug, key, content }, { upsert: true, new: true });

        res.status(200).json({
            success: true,
            status: 200,
            message: "Page content updated successfully!",
            data: updated
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error!",
            error: error
        });
    }
};

export {
    getStaticPage,
    updateStaticPage
}