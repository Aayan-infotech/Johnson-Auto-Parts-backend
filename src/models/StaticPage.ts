import mongoose, {Schema} from "mongoose";
import { IStaticPage } from "./interfaces/IStaticContent";

const StaticPageSchema = new Schema<IStaticPage>(
    {
        slug: {type: String, required: true},
        key: {type: String, required: true},
        content: {
            en: {type: String},
            fr: {type: String},
        }
    },
    { timestamps: true}
);

export default mongoose.model<IStaticPage>("StaticPage", StaticPageSchema);