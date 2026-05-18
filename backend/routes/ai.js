import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { extractDataFromDocument, verifyDocumentAuthenticity } from "../services/documentExtraction.js";
import { generateVerificationScore, detectDuplicateLandings, verifyCoordinates, generateVerificationReport } from "../services/landVerification.js";
import { handleChat } from "../services/chatbot.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for document uploads
const upload = multer({
  dest: path.join(__dirname, "../uploads/ai-docs"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, GIF, PDF allowed."));
    }
  },
});

/**
 * POST /ai/extract-document
 * Extract data from a single document (OCR)
 */
router.post("/extract-document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document uploaded" });
    }

    const result = await extractDataFromDocument(req.file.path);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      extracted: result.data,
      confidence: result.data.confidence,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/verify-document
 * Verify document authenticity
 */
router.post("/verify-document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document uploaded" });
    }

    const docType = req.body.docType || "land_deed";
    const result = await verifyDocumentAuthenticity(req.file.path, docType);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      verification: result.verification,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/analyze-land
 * Generate AI verification score for a land listing
 */
router.post("/analyze-land", async (req, res) => {
  try {
    const { landData, documentsExtracted } = req.body;

    if (!landData) {
      return res.status(400).json({ error: "landData required" });
    }

    const verificationResult = await generateVerificationScore(landData, documentsExtracted || {});

    if (!verificationResult.success) {
      return res.status(500).json({ error: verificationResult.error });
    }

    res.json({
      success: true,
      verification: verificationResult.verification,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/check-duplicate
 * Check for duplicate/suspicious listings
 */
router.post("/check-duplicate", async (req, res) => {
  try {
    const { currentLand, similarLands } = req.body;

    if (!currentLand) {
      return res.status(400).json({ error: "currentLand required" });
    }

    const fraudResult = await detectDuplicateLandings(currentLand, similarLands || []);

    if (!fraudResult.success) {
      return res.status(500).json({ error: fraudResult.error });
    }

    res.json({
      success: true,
      fraudDetection: fraudResult.fraud,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/verify-coordinates
 * Verify land coordinates
 */
router.post("/verify-coordinates", async (req, res) => {
  try {
    const { coordinates, landmark, address } = req.body;

    if (!coordinates) {
      return res.status(400).json({ error: "coordinates required" });
    }

    const result = verifyCoordinates(coordinates, landmark, address);

    res.json({
      success: true,
      coordinateVerification: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/full-verification
 * Complete verification workflow for a land listing
 */
router.post("/full-verification", async (req, res) => {
  try {
    const { landData, documentsExtracted, similarLands } = req.body;

    if (!landData) {
      return res.status(400).json({ error: "landData required" });
    }

    // Run all checks in parallel
    const [verificationScore, duplicateCheck, coordinateCheck] = await Promise.all([
      generateVerificationScore(landData, documentsExtracted || {}),
      detectDuplicateLandings(landData, similarLands || []),
      Promise.resolve(verifyCoordinates(landData.coordinates, landData.landmark, landData.address)),
    ]);

    const report = generateVerificationReport(verificationScore, duplicateCheck, coordinateCheck);

    res.json({
      success: true,
      verificationReport: report,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /ai/health
 * Check AI service status
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      documentExtraction: "enabled",
      landVerification: "enabled",
      fraudDetection: "enabled",
    },
  });
});

/**
 * POST /ai/chat
 * Handle chatbot messages
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "An array of messages is required" });
    }

    const result = await handleChat(messages);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      reply: result.reply,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
