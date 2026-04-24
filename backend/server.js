import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import bcrypt from "bcrypt";

import { createSubmissionFolder, uploadFile } from "./config/googleDrive.js";

import User from "./models/User.js";
import Land from "./models/Land.js";
import Request from "./models/Request.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Geo-Vision";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/* =========================
   AUTH MIDDLEWARE
========================= */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin" && user.role !== "agent") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

/* =========================
   LAND ROUTES
========================= */

app.get("/land", async (req, res) => {
  try {
    const lands = await Land.find({
      verificationStatus: 1,
    }).populate("ownerId", "username");

    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/land/mine", authenticateToken, async (req, res) => {
  try {
    const lands = await Land.find({ ownerId: req.user.id }).sort({ _id: -1 });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/land/pending", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const lands = await Land.find({ verificationStatus: 0 })
      .populate("ownerId", "username email phone")
      .sort({ _id: -1 });

    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/land/:id", async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate("ownerId");

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/land/:id", authenticateToken, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    if (land.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this land",
      });
    }

    const updatableFields = [
      "fatherName",
      "dob",
      "address",
      "landArea",
      "pan",
      "regNum",
      "coordinates",
      "landmark",
      "propertyValue",
      "sellingStatus",
      "documents",
      "driveFolder",
    ];

    for (const field of updatableFields) {
      if (field in req.body) {
        land[field] = req.body[field];
      }
    }

    await land.save();

    res.json({
      message: "Land updated",
      land,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

app.delete("/land/:id", authenticateToken, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    if (land.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this land",
      });
    }

    await land.deleteOne();

    res.json({
      message: "Land deleted",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.patch("/land/:id/verify", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    land.verificationStatus = 1;
    land.verificationNote = "";
    await land.save();

    res.json({
      message: "Land verified",
      land,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.patch("/land/:id/reject", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    land.verificationStatus = 2;
    land.verificationNote = req.body.reason || "Rejected during verification";
    await land.save();

    res.json({
      message: "Land rejected",
      land,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   AUTH ROUTES
========================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: user.username,
      role: user.role,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      ...req.body,
      role: "user",
      password: hashedPassword,
    });

    await user.save();

    res.json({
      message: "User registered successfully",
    });

  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   ADD LAND
========================= */

app.post("/land/add", authenticateToken, async (req, res) => {
  try {

    const landData = new Land({
      ...req.body,
      ownerId: req.user.id,
      driveFolder: req.body.driveFolder,
      documents: req.body.documents,
    });

    await landData.save();

    res.json({
      message: "Land submitted for verification",
      landData,
    });

  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

/* =========================
   CONTACT REQUEST SYSTEM
========================= */

app.post("/request/contact", authenticateToken, async (req, res) => {

  try {

    const buyerId = req.user.id;
    const { landId } = req.body;

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    if (land.ownerId.toString() === buyerId) {
      return res.json({ message: "You own this land" });
    }

    const existing = await Request.findOne({
      landId,
      buyerId,
    });

    if (existing) {
      return res.json({
        message: "Request already sent",
      });
    }

    const request = await Request.create({
      landId,
      buyerId,
      sellerId: land.ownerId,
    });

    res.json({
      message: "Request sent",
      request,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

/* =========================
   SELLER REQUESTS
========================= */

app.get("/request/my", authenticateToken, async (req, res) => {

  try {

    const requests = await Request.find({
      sellerId: req.user.id,
      status: "pending",
    })
      .populate("landId")
      .populate("buyerId", "username email phone");

    res.json(requests);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

/* =========================
   APPROVE REQUEST
========================= */

app.post("/request/approve", authenticateToken, async (req, res) => {

  try {

    const { requestId } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to approve this request",
      });
    }

    request.status = "approved";
    await request.save();

    res.json({
      message: "Request approved",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

app.post("/request/reject", authenticateToken, async (req, res) => {

  try {

    const { requestId, reason } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to reject this request",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason || "Request rejected by seller";
    await request.save();

    res.json({
      message: "Request rejected",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

/* =========================
   CHECK REQUEST STATUS
========================= */

app.get("/request/check/:landId", authenticateToken, async (req, res) => {

  try {

    const buyerId = req.user.id;

    const request = await Request.findOne({
      landId: req.params.landId,
      buyerId,
      status: "approved",
    });

    if (!request) {
      return res.json({
        approved: false,
      });
    }

    const land = await Land.findById(req.params.landId).populate("ownerId");

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    res.json({
      approved: true,
      phone: land.ownerId.phone,
      email: land.ownerId.email,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }

});

/* =========================
   DOCUMENT UPLOAD
========================= */

app.post(
  "/land/upload-docs",
  authenticateToken,
  upload.array("documents"),
  async (req, res) => {

    try {

      const folderId = await createSubmissionFolder();
      const fileIds = [];

      for (const file of req.files) {

        const fileId = await uploadFile(file, folderId);
        fileIds.push(fileId);

        fs.unlinkSync(file.path);

      }

      res.json({
        folderId,
        files: fileIds,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  }
);

/* =========================
   FALLBACK
========================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* =========================
   SERVER START
========================= */

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/* =========================
   DATABASE CONNECTION
========================= */

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URI);
  await syncLandIndexes();
}

async function syncLandIndexes() {
  const landCollection = mongoose.connection.collection("lands");
  const indexes = await landCollection.indexes();

  if (indexes.some((index) => index.name === "aadhar_1")) {
    await landCollection.dropIndex("aadhar_1");
  }

  await Land.syncIndexes();
}
