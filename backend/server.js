import express from 'express';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";

import { createFolder, uploadFile } from "./config/googleDrive.js";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();
import User from './models/User.js';
import Land from './models/Land.js';
const SECRET = process.env.JWT_SECRET;
const upload = multer({ dest: "uploads/" });

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Token required"
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }
}

// Routes
app.get("/land", async (req, res) => {
    try {
        const lands = await Land.find({verificationStatus: 1});
        res.json(lands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/land/:id", async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: "Land not found" });
        }
        res.json(land);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                message: "Wrong password"
            });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "24h" });
        res.json({
            message: "Login successful",
            token
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.post("/signup", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({
            message: "User registered successfully"
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.post("/land/add", authenticateToken, async (req, res) => {
    try {
        const landData = new Land({
            ...req.body,
            submittedBy: req.user.id,
            driveFolder: req.body.folderId,
            documents: req.body.files
        });
        await landData.save();
        res.json({
            message: "Land submitted for verification",
            landData
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.post(
    "/land/upload-docs",
    authenticateToken,
    upload.array("documents"),
    async (req, res) => {
        try {
            const folderName = `Land_${Date.now()}`;
            const folderId = await createFolder(folderName);
            const fileIds = [];
            for (const file of req.files) {
                const fileId = await uploadFile(file, folderId);
                fileIds.push(fileId);
                fs.unlinkSync(file.path);
            }

            res.json({
                message: "Documents uploaded successfully",
                folderId,
                files: fileIds
            });
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Geo-Vision');
}