const Order = require("../models/orderModel");
const axios = require("axios");

exports.createOrder = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "userId, productId and quantity are required"
            });
        }

        let user;
        let product;

        try {
            const userResponse = await axios.get(
                `${process.env.USER_SERVICE_URL}/users/${userId}`,
                {
                    timeout: 3000
                }
            );

            user = userResponse.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(503).json({
                success: false,
                message: "User Service unavailable"
            });
        }

        try {
            const productResponse = await axios.get(
                `${process.env.PRODUCT_SERVICE_URL}/products/${productId}`,
                {
                    timeout: 3000
                }
            );

            product = productResponse.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            return res.status(503).json({
                success: false,
                message: "Product Service unavailable"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient product stock"
            });
        }

        const order = new Order({
            userId,
            productId,
            quantity
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order,
                user,
                product
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};