import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import routes from "./routes/index";

dotenv.config();
connectDB();

const app: Application = express();
app.use(express.json());
app.use(cors());

app.use("/", routes);

export default app;