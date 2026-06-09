import express from "express";
import { createPaymentIntent } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-payment-intent", createPaymentIntent);

export default paymentRouter;