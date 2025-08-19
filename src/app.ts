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
    secret: process.env.SESSION_SECRET || "auto-parts",
    resave: false,
    saveUninitialized: false, // Change this to false
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://robert:TKGIDJuwsqlfYvRS@cluster0.vnrxr0v.mongodb.net/autoparts",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://3.208.14.86:2027",
      "http://localhost:5173",
      "http://3.208.14.86:2025",
      "http://localhost:3000",
      "http://18.209.91.97:2564",
      "http://18.209.91.97:6542",
      "http://18.209.91.97:2233"
    ],
    credentials: true, // Allow credentials
  })
);

app.use("/", routes);

export default app;
