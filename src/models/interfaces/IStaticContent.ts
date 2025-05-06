import { Document } from "mongoose";

export interface IStaticPage extends Document {
    slug: string;
    key: string;
    content: {
        en: string,
        fr: string
    };

}