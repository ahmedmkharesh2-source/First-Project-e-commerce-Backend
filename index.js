import dotenv from "dotenv";
// ✅ لازم يكون أول شي قبل أي import ثاني
dotenv.config({ path: './.env' });
dotenv.config({ path: './backend/.env' });

import express from "express";
const app = express();

import Connection from "./db/conn.js";
import productsRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import orderRouter from "./routes/orderRoutes.js";
import cors from "cors";
import paymentRouter from "./routes/paymentRoutes.js";

// console.log("========== CLOUDINARY TEST ==========");
// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("API Secret Exists:", !!process.env.CLOUDINARY_API_SECRET);
// console.log("====================================");

// app.use(cors({
//     origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//         "https://first-project-e-commerce-frontend.vercel.app" // ✅ سنعدل هذا بعد ما نحصل على رابط Vercel
//     ],
//     credentials: true
// }));

// --------------------
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://first-project-e-commerce-frontend.vercel.app"
    ],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

Connection();

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", userRouter);   
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payment", paymentRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});