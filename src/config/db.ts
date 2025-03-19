import mongoose from "mongoose";
import getConfig from "../config/loadConfig";


const connectDB = async () => {
  try {
    const config = await getConfig();
    await mongoose.connect("mongodb+srv://ujjwalsingh:ujjwal123@cluster0.qbl1z.mongodb.net/autoparts");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
