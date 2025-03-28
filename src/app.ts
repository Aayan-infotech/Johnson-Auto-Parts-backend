import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db";
import routes from "./routes/index";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv"
dotenv.config();

connectDB();

const app: Application = express();
app.use(
    session({
      secret: process.env.SESSION_SECRET||"john-secret",
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day expiry
    })
  );
app.use(express.json());
app.use(cors({
    origin: ['http://3.223.253.106:2564', 'http://localhost:5173', 'http://3.223.253.106:6542', 'http://localhost:3000'],
    credentials: true
}));

app.use("/", routes);

export default app;