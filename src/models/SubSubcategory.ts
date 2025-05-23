import mongoose, {Schema} from "mongoose";
import {v4 as uuidv4} from "uuid";
import {ISubSubcategory} from "./interfaces/ISubSubcategory";

const SubSubcategorySchema = new Schema<ISubSubcategory>({
    name: {
        en: {
            type: String,
            required: true,
            unique: true
        },
        fr: {
            type: String,          
        }
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    picture: {
        type: String,
        required: false,
    },
    categoryId: {
        type: String,
        required: true
    },
    subcategoryId: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }
},{
    timestamps: true,
});

export default mongoose.model<ISubSubcategory>("SubSubcategory", SubSubcategorySchema);