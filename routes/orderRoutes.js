import express from "express";
import { isAdmin, isAuthenticatedUser } from "../util/userAuth.js";
import { createOrderController, getAllOrders, getSingleOrder, myOrderDetails, updateOrderStatus} from "../controls/OrderControllers.js";
const orderRouter = express.Router()

orderRouter.post("/create-order", isAuthenticatedUser, createOrderController);
orderRouter.get("/order-details/:id", isAuthenticatedUser, isAdmin("admin"), getSingleOrder);
orderRouter.get("/my-order", isAuthenticatedUser, myOrderDetails);
orderRouter.get("/all-orders", isAuthenticatedUser, isAdmin("admin"), getAllOrders)
orderRouter.put("/update-order-status/:id", isAuthenticatedUser, isAdmin("admin"), updateOrderStatus)

export default orderRouter;