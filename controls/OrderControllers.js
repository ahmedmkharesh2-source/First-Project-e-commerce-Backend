import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const createOrderController = async (req, res) => {
    try {
        const { orderItems, shippingInfo, paymentInfo, taxPrice, shippingPrice, totalPrice, orderstatus } = req.body;


        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot create order. Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }
        }

        const order = await Order.create({
            orderItems,
            shippingInfo,
            paymentInfo,
            taxPrice,
            shippingPrice,
            totalPrice,
            orderstatus,
            user: req.user._id,
            paidAt: Date.now()
        });

        if (!order) {
            return res.status(400).json({
                success: false,
                message: "Order not created successfully"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
// get single order api
export const getSingleOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if (!order) {
            return res.status(400).json({
                success: false,
                message: "Order not found"
            })
        }
        return res.status(200).json({
            success: true,
            order
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }

        )
    }
}
export const myOrderDetails = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        if (!orders) {
            return res.status(400).json({
                success: false,
                message: "No orders found for this user"
            })
        }
        return res.status(200).json({
            success: true,
            orders
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }

        )
    }
}
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        if (!orders) {
            return res.status(400).json({
                success: false,
                message: "No orders found"
            })
        }
        let total = 0
        orders.forEach(element => {
            total = total + orders.totalPrice

        });
        return res.status(200).json({
            success: true,
            total,
            orders
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }

        )
    }
}
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(400).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "This order has already been delivered"
            })
        }

        console.log("Order Items:", order.orderItems);

        order.orderStatus = req.body.status;
        // await Promise.all(order.orderItems.map(item => updatestock(item.product, item.quantity)))

        if (req.body.status === "Delivered") {
            await Promise.all(
                order.orderItems.map(item => {
                    console.log(item.product, item.quantity)
                    updatestock(item.product, item.quantity)
                }
                )
            );
        }
        await order.save({ runvalidators: true });
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        })


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + err.message
        })
    }
}

async function updatestock(id, quantity) {
    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product not found");
    }

    if (!quantity || quantity <= 0) {
        throw new Error("Invalid quantity");
    }

    if (product.stock < quantity) {
        throw new Error("Insufficient stock");
    }

    product.stock -= quantity;

    console.log(`Updating stock: ${product.title}, New Stock: ${product.stock}`);

    await product.save();
}
