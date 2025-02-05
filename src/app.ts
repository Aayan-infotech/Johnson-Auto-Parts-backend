import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db";
import routes from "./routes/index";

connectDB();

const app: Application = express();
app.use(express.json());
app.use(cors());

app.use("/", routes);

export default app;