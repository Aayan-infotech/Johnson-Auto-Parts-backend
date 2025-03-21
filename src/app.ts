import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db";
import routes from "./routes/index";

connectDB();

const app: Application = express();
app.use(express.json());
app.use(cors({
    origin: ['http://3.223.253.106:2564', 'http://localhost:5173', 'http://3.223.253.106:6542'],
    credentials: true
}));

app.use("/", routes);

export default app;