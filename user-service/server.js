require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/users");

const app = express();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        service: "User Service",
        status: "healthy"
    });
});

app.use("/users", userRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to User MongoDB");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`User Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    });