import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db";
import routes from "./routes/index";
import session from "express-session";
import MongoStore from "connect-mongo";
import getConfig from "./config/loadConfig";
import dotenv from "dotenv";
dotenv.config();

const config = getConfig();
connectDB();

const app: Application = express();
app.use(
    session({
      secret: process.env.SESSION_SECRET||"john-secret",
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl:"mongodb+srv://ujjwalsingh:ujjwal123@cluster0.qbl1z.mongodb.net/autoparts" }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: false, 
        sameSite: "lax",
      },
    })
  );
app.use(express.json());
app.use(cors({
    origin: ['http://3.223.253.106:2564', 'http://localhost:5173', 'http://3.223.253.106:6542', 'http://localhost:3000'],
    credentials: true
}));

app.use("/", routes);

export default app;