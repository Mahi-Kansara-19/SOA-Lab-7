const mongoose = require("mongoose");
const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};