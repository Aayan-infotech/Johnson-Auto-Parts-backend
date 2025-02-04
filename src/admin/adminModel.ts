import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";


interface IAdmin extends Document {
    email: string;
    password: string;
}

const AdminSchema = new Schema<IAdmin>({
    email: {
        type: String,
        required: true,
        unique: true,
        default: "adminjohnson@yopmail.com",
        immutable: true,
    },
    password: {
        type: String,
        required: true,
        default: "admin",
    },
}, { timestamps: true });

AdminSchema.pre("save", async function (next) {
    if (this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash("admin", salt);
    }
    next();
});

export default mongoose.model<IAdmin>("Admin", AdminSchema);
