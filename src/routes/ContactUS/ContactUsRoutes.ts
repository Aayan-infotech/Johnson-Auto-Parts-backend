import express from 'express';
import {
  submitQuestion,
  answerQuestion,
} from '../../controllers/ContactUs/Contact';

const router = express.Router();

// User submits a question
router.post('/create', submitQuestion);

// Admin answers a question
router.put('/admin/contact-us/:id/answer', answerQuestion);

export default router;
