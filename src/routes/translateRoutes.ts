import express, { Request, Response } from 'express';
import * as googleTranslate from '@vitalets/google-translate-api';

const router = express.Router();

interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

router.post('/content', async (req: Request, res: Response) => {
  const { text, targetLang, sourceLang = 'en' }: TranslationRequest = req.body;

  try {
    const response = await googleTranslate.translate(text, {
      from: sourceLang,
      to: targetLang,
    });
    res.json({ translatedText: response.text });
  } catch (error: any) {
    console.error('Translation Error:', error.message || error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

export default router;
