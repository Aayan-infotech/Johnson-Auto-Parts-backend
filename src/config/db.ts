import mongoose from "mongoose";
import getConfig from "../config/loadConfig";


const connectDB = async () => {
  try {
    const config = await getConfig();
    await mongoose.connect(config.MONGO_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
