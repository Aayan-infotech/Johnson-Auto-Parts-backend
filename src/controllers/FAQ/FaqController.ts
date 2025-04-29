import { Request, Response } from "express";
import { translateText } from '../../utills/translateService';
import FaqModel from "../../models/FaqModel";

// Add faq
export const addFaq = async (req: Request, res: Response) => {
    try {
        const { question, answer } = req.body;

        if (await FaqModel.findOne({ "question.en": question })) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Question already added!"
            });
        }

        // const questionFr = await translateText(question, "fr");
        // const answerFr = await translateText(answer, "fr");

        const [questionFr, answerFr] = await Promise.all([
            translateText(question, "fr"),
            translateText(answer, "fr")
        ]);

        const faq = await new FaqModel({
            question: {
                en: question,
                fr: questionFr
            },
            answer: {
                en: answer,
                fr: answerFr
            }
        }).save();

        res.status(201).json({
            success: true,
            status: 201,
            message: "FAQ created successfully!",
            data: faq
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

// get faq 
export const getFaq = async (req: Request, res: Response) => {
    try {
        const { lang } = req.query as { lang?: string };
        const faqs = await FaqModel.find();

        const translatedFaqs = faqs.map((text) => ({
            id: text._id,
            question: text.question[lang as keyof typeof text.question] || text.question.en,
            answer: text.answer[lang as keyof typeof text.answer] || text.answer.en
        }));

        res.status(200).json({
            success: true,
            status: 200,
            message: "FAQs fetched successfully!",
            data: translatedFaqs
        });
    }
    catch (error) {
        return res.status(500).json({
            ssuccess: false,
            status: 500,
            message: "Internal server error!",
            error: error
        });
    }
};

// delete Faqs
export const deleteFaq = async (req: Request, res: Response) => {
    try {
        const faqId = req.params.faqId;

        const faq = await FaqModel.findByIdAndDelete(faqId);
        if (!faq) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "FAQ not found!"
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "FAQ deleted successfully!"
        })
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