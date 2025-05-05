// controllers/ContactUsController.ts
import { Request, Response } from 'express';
import ContactUs from "../../models/ContactUs";


export const submitQuestion = async (req: Request, res: Response) => {
    try {
        const { userId, email, message, phone } = req.body;

        if (!email || !message) {
            return res.status(400).json({
                success: false,
                status: 400,
                error: 'Email and message are required.'
            });
        }

        const newEntry = new ContactUs({
            userId,
            email,
            message,
            phone,
            createdAt: new Date()
        });

        await newEntry.save();

        res.status(201).json({
            success: true,
            status: 201,
            message: 'Your question has been submitted.',
            data: newEntry
        });
    } catch (error) {
        console.error('Submit question error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Internal server error',
            error: error
        });
    }
};

// Optional: For admin to answer
export const answerQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        const updated = await ContactUs.findByIdAndUpdate(
            id,
            { answer },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.status(200).json({ message: 'Answer submitted', data: updated });
    } catch (error) {
        console.error('Answer question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
