import { Response, Request } from 'express';
import StaticPage from "../models/StaticPage";
import { translateText } from '../utills/translateService'
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import puppeteer from 'puppeteer';
import { generatePdfHtml } from '../utills/pdfToHtml';


// get static page
const getStaticPage = async (req: Request, res: Response) => {
    try {
        const { lang } = req.query as { lang?: string };
        const slug = req.params.slug;

        const content = await StaticPage.findOne({ slug });
        if (!content) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Content not found!"
            });
        }

        const originalContent = content.content.en;
        let translatedContentText = originalContent;
        if (lang && lang !== 'en') {
            const existingTranslation = content.content[lang as keyof typeof content.content];
            if (existingTranslation) {
                translatedContentText = existingTranslation;
            } else {
                translatedContentText = await translateText(originalContent, lang);
                content.content[lang as keyof typeof content.content] = translatedContentText;
                await content.save();
            }
        }
        const translatedContent = {
            id: content._id,
            key: content.key,
            content: translatedContentText,
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
        
        // Get the English content (either directly from string or from content.en)
        const contentEn = typeof content === 'string' ? content : content.en;
        
        // Translate to French
        let contentFr;
        try {
            contentFr = await translateText(contentEn, "fr");
        } catch (translationError) {
            console.error("Translation failed:", translationError);
            // Fall back to existing French content or English content if translation fails
            const existing = await StaticPage.findOne({ slug });
            contentFr = existing?.content?.fr || contentEn;
        }

        // Update or create the document
        const updated = await StaticPage.findOneAndUpdate(
            { slug },
            {
                slug,
                key,
                content: {
                    en: contentEn,
                    fr: contentFr
                }
            },
            { upsert: true, new: true }
        );

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

const downloadStaticPageAsPDF = async (req: Request, res: Response) => {
    try {
        const { lang } = req.query as { lang?: string };
        const slug = req.params.slug;


        const content = await StaticPage.findOne({ slug });
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }


        const translatedContent = content.content?.[lang as keyof typeof content.content] || content.content?.en;


        // Convert local logo image to base64
        const logoPath = path.join(__dirname, '../../public/logo.png');
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;


        const html = generatePdfHtml(
            'À propos de nous',
            translatedContent,
            logoDataUrl,
            new Date().toLocaleDateString('fr-FR')
        );


        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            devtools: true
        });
        const page = await browser.newPage();


        await page.setContent(html, { waitUntil: 'load' });
        await new Promise(resolve => setTimeout(resolve, 500));


        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '40px', left: '20px', right: '20px' },
            path: 'output.pdf'
        });
        await browser.close();
        if (!pdfBuffer || pdfBuffer.length < 100) {
            throw new Error('PDF buffer is empty or too small.');
        }


        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=${slug}-${lang || 'en'}.pdf`,
            'Content-Length': pdfBuffer.length
        });


        return res.send(pdfBuffer);


    } catch (error) {
        console.error("PDF generation error:", error);
        return res.status(500).json({ success: false, message: 'Failed to generate PDF', error });
    }
};

const downloadPdfsAsZip = async (req: Request, res: Response) => {
    try {
        const { lang } = req.query as { lang?: string };
        const slugs = ['terms-and-conditions', 'privacy-policy'];
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.attachment('documents.zip');
        archive.pipe(res);
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const logoPath = path.join(__dirname, '../../public/logo.png');
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;
        for (const slug of slugs) {
            const content = await StaticPage.findOne({ slug });
            if (!content) continue;
            const translatedContent = content.content?.[lang as keyof typeof content.content] || content.content?.en;
            const html = generatePdfHtml(
                slug === 'terms-and-conditions' ? 'Terms & Conditions' : 'Warranty Policy',
                translatedContent,
                logoDataUrl,
                new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')
            );
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', bottom: '40px', left: '20px', right: '20px' }
            });
            await page.close();
            archive.append(Buffer.from(pdfBuffer), { name: `${slug}.pdf` });
        }
        await browser.close();
        archive.finalize();
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate ZIP', error });
    }
};



export {
    getStaticPage,
    updateStaticPage,
    downloadStaticPageAsPDF,
    downloadPdfsAsZip
}