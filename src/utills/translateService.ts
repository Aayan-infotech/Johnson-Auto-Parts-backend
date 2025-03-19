import * as googleTranslate from "@vitalets/google-translate-api";

export const translateText = async (text: string, targetLang: string, sourceLang: string = "en"): Promise<string> => {
    try {
        const response = await googleTranslate.translate(text, { from: sourceLang, to: targetLang }); // ✅ Fixed function call
        return response.text;
    } catch (error: any) {
        console.error("Translation Error:", error.message || error);
        return text; // Return original text if translation fails
    }
};
