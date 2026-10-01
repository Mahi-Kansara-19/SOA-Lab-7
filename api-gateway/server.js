require("dotenv").config();

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = process.env.PORT || 3000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "API Gateway",
        status: "healthy"
    });
});

function gatewayLogger(targetService) {
    return (req, res, next) => {
        const start = Date.now();

        res.on("finish", () => {
            const time = Date.now() - start;

            console.log(
                `${req.method} ${req.originalUrl} -> ${targetService} -> ${res.statusCode} (${time}ms)`
            );
        });

        next();
    };
}

function createServiceProxy(targetService) {
    return createProxyMiddleware({
        target: targetService,
        changeOrigin: true,

        on: {
            error: (error, req, res) => {
                console.error(
                    `Gateway error while connecting to ${targetService}:`,
                    error.message
                );

                if (!res.headersSent) {
                    res.status(503).json({
                        success: false,
                        message: "Target service unavailable"
                    });
                }
            }
        }
    });
}

app.use(
    "/users",
    gatewayLogger("User Service"),
    createServiceProxy(USER_SERVICE_URL)
);

app.use(
    "/products",
    gatewayLogger("Product Service"),
    createServiceProxy(PRODUCT_SERVICE_URL)
);

app.use(
    "/orders",
    gatewayLogger("Order Service"),
    createServiceProxy(ORDER_SERVICE_URL)
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Gateway route not found"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`User Service: ${USER_SERVICE_URL}`);
    console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
    console.log(`Order Service: ${ORDER_SERVICE_URL}`);
});