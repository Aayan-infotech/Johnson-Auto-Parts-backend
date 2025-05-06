import { Response, Request } from 'express';
import StaticPage from "../models/StaticPage";
import { translateText } from '../utills/translateService'

// get static page
const getStaticPage = async (req: Request, res: Response) => {
    try {
        const { lang } = req.query as { lang?: string };
        const slug = req.params.slug;

        const content = await StaticPage.findOne({ slug });
        if(!content){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Content not found!"
            });
        }
        const translatedContent = {
            id: content._id,
            content: content.content?.[lang as keyof typeof content.content] || content.content?.en,
          };

        res.status(200).json({
            success: true,
            status: 200,
            message: "Page content fetched successfully!",
            data: translatedContent
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
        const { key, content } = req.body;
        const contentFr = await translateText(content, "fr");

        const updated = await StaticPage.findOneAndUpdate({ slug }, { slug, key, content:{en: content, fr: contentFr} }, { upsert: true, new: true });


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