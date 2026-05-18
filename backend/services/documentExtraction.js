import fs from "fs";
import path from "path";
import { aiConfig } from "../config/aiConfig.js";

/**
 * Extract structured data from land documents using OpenAI Vision
 * Supports: PDFs, Images (JPG, PNG), Screenshots
 */
export async function extractDataFromDocument(filePath) {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");
    const mimeType = getMimeType(filePath);

    // Call OpenAI Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: `Extract the following information from this land/property document. Return ONLY valid JSON, no markdown.

Extract exactly these fields (use null if not found):
{
  "ownerName": "person's full name",
  "fatherName": "father's name if present",
  "landArea": "area in acres or sq meters",
  "address": "full property address",
  "regNum": "registration/survey number",
  "pan": "PAN number if present",
  "dob": "date of birth if present (ISO format)",
  "docType": "type of document (deed, survey, title, etc)",
  "confidence": "confidence percentage 0-100",
  "alerts": ["any red flags or issues found"]
}

Be strict and only extract clearly visible information.`,
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Extract JSON object from potential conversational text and markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      // Fallback
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    // Parse JSON response
    const extractedData = JSON.parse(content);

    return {
      success: true,
      data: extractedData,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Document extraction error:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Verify document authenticity indicators
 */
export async function verifyDocumentAuthenticity(filePath, documentType = "land_deed") {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");
    const mimeType = getMimeType(filePath);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: `Analyze this ${documentType} document for authenticity. Return ONLY valid JSON.

Check for:
1. Official watermarks/seals
2. Government stamps/logos
3. Tampering signs (blurring, edits, inconsistent text)
4. Font consistency
5. Quality and clarity
6. Document age indicators

Return JSON:
{
  "isLikelyAuthentic": true/false,
  "authenticityScore": 0-100,
  "flags": ["potential issues or red flags"],
  "details": {
    "hasWatermark": true/false,
    "hasStamps": true/false,
    "signsOfTampering": true/false,
    "fontConsistent": true/false
  },
  "recommendation": "APPROVE/REVIEW/REJECT"
}`,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    const verificationResult = JSON.parse(content);

    return {
      success: true,
      verification: verificationResult,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Document verification error:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Extract text from document for OCR
 */
export async function extractTextFromDocument(filePath) {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");
    const mimeType = getMimeType(filePath);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: "Extract ALL readable text from this document exactly as it appears. Return plain text only.",
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    return {
      success: true,
      text: extractedText,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Text extraction error:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Helper: Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "image/jpeg";
}

/**
 * Batch process multiple documents
 */
export async function processBatchDocuments(filePaths) {
  const results = [];

  for (const filePath of filePaths) {
    try {
      const extracted = await extractDataFromDocument(filePath);
      const verified = await verifyDocumentAuthenticity(filePath);

      results.push({
        file: filePath,
        extraction: extracted,
        verification: verified,
      });

      // Rate limiting - OpenAI API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        file: filePath,
        error: error.message,
      });
    }
  }

  return results;
}
