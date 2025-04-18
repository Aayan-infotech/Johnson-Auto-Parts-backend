import mongoose, {Schema} from "mongoose";
import { IStaticPage } from "./interfaces/IStaticContent";

const StaticPageSchema = new Schema<IStaticPage>(
    {
        key: {type: String, required: true},
        content: {type: String, required: true}
    },
    { timestamps: true}
);

export default mongoose.model<IStaticPage>("StaticPage", StaticPageSchema);