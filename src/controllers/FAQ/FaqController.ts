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

        res.status(200).json({
            success: true,
            status: 200,
            message: "FAQ created successfully!",
            data: faq
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error!"
        });
    }
};