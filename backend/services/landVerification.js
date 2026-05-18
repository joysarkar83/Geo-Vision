import { aiConfig } from "../config/aiConfig.js";

/**
 * Generate AI Verification Score for a Land listing
 */
export async function generateVerificationScore(landData, documentsExtracted) {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const verificationPrompt = buildVerificationPrompt(landData, documentsExtracted);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.openAI.modelText,
        messages: [
          {
            role: "system",
            content: `You are an expert land verification AI for a property marketplace. 
Analyze land listings for legitimacy, consistency, and authenticity. 
Return ONLY valid JSON without markdown formatting.`,
          },
          {
            role: "user",
            content: verificationPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for consistency
        max_tokens: 1000,
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
    console.error("Verification score generation error:", error);
    return {
      success: false,
      error: error.message,
      verificationScore: 0,
      recommendation: "MANUAL_REVIEW",
      timestamp: new Date(),
    };
  }
}

/**
 * Check for duplicate/suspicious listings
 */
export async function detectDuplicateLandings(currentLand, similarLands) {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const comparisonPrompt = buildDuplicateDetectionPrompt(currentLand, similarLands);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.openAI.modelText,
        messages: [
          {
            role: "system",
            content:
              "You are a fraud detection specialist. Identify duplicate listings and suspicious patterns. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: comparisonPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
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
    const fraudResult = JSON.parse(content);

    return {
      success: true,
      fraud: fraudResult,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Duplicate detection error:", error);
    return {
      success: false,
      error: error.message,
      isDuplicate: false,
      timestamp: new Date(),
    };
  }
}

/**
 * Verify land coordinates against satellite imagery context
 */
export async function verifyCoordinates(coordinates, landmark, address) {
  try {
    // For now, basic validation
    // In production, integrate with Google Maps/Mapbox API
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return {
        valid: false,
        reason: "Invalid coordinates format",
      };
    }

    const [lat, lng] = coordinates[0];

    // Validate lat/lng ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        valid: false,
        reason: "Coordinates out of valid range",
      };
    }

    // India-specific validation (adjust as needed)
    if (!(lat >= 8.4 && lat <= 35.5 && lng >= 68.7 && lng <= 97.25)) {
      return {
        valid: false,
        reason: "Coordinates outside India boundaries",
      };
    }

    return {
      valid: true,
      confidence: 0.95,
      coordinates: { lat, lng },
    };
  } catch (error) {
    return {
      valid: false,
      reason: error.message,
    };
  }
}

/**
 * Build AI prompt for verification
 */
function buildVerificationPrompt(landData, documentsExtracted) {
  return `Analyze this land listing for verification:

LAND DETAILS:
- Owner: ${landData.ownerId}
- Land Area: ${landData.landArea} units
- Address: ${landData.address}
- Landmark: ${landData.landmark}
- Registration Number: ${landData.regNum}
- PAN: ${landData.pan}
- Property Value: ${landData.propertyValue}
- Coordinates: ${JSON.stringify(landData.coordinates)}

EXTRACTED DOCUMENT DATA:
${JSON.stringify(documentsExtracted, null, 2)}

Analyze the following:
1. Consistency between self-reported data and document extractions
2. Reasonableness of property value for location/area
3. Document authenticity indicators
4. Any red flags or inconsistencies
5. Overall verification confidence (0-100%)

Return JSON with this structure:
{
  "verificationScore": 0-100,
  "status": "APPROVED/APPROVED_WITH_REVIEW/NEEDS_REVIEW/REJECTED",
  "consistencyCheck": {
    "dataMatches": true/false,
    "discrepancies": ["list of any mismatches"]
  },
  "documentQuality": {
    "authentic": true/false,
    "issues": ["list any concerns"]
  },
  "riskFactors": {
    "priceAnomaly": true/false,
    "missingInfo": true/false,
    "coordinateIssues": true/false
  },
  "recommendation": "APPROVE/REVIEW/REJECT",
  "reasoning": "Brief explanation of score"
}`;
}

/**
 * Build prompt for duplicate detection
 */
function buildDuplicateDetectionPrompt(currentLand, similarLands) {
  return `Check if this land listing is a duplicate or fraudulent reposting:

CURRENT LISTING:
- Area: ${currentLand.landArea}
- Address: ${currentLand.address}
- Coordinates: ${JSON.stringify(currentLand.coordinates)}
- Owner: ${currentLand.ownerId}
- Posted: ${currentLand.createdAt}

SIMILAR LISTINGS IN DATABASE:
${similarLands
  .map(
    (land, i) => `
Listing ${i + 1}:
- Area: ${land.landArea}
- Address: ${land.address}
- Coordinates: ${JSON.stringify(land.coordinates)}
- Owner: ${land.ownerId}
- Posted: ${land.createdAt}
`
  )
  .join("")}

Determine if current listing is:
1. Legitimate (different property)
2. Likely duplicate (same property, possibly fraudulent)
3. Suspicious pattern (similar listings by same owner)

Return JSON:
{
  "isDuplicate": true/false,
  "duplicateLikelihood": 0-100,
  "matchedWith": ["IDs of similar listings"],
  "fraudRiskLevel": "LOW/MEDIUM/HIGH",
  "reasons": ["list of matching patterns"],
  "action": "APPROVE/FLAG/REJECT"
}`;
}

/**
 * Generate verification report
 */
export function generateVerificationReport(verificationScore, duplicateCheck, coordinateCheck) {
  const overallScore = calculateOverallScore(verificationScore, duplicateCheck, coordinateCheck);

  return {
    overallScore,
    status: determineStatus(overallScore),
    checks: {
      verification: verificationScore,
      duplicateDetection: duplicateCheck,
      coordinates: coordinateCheck,
    },
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };
}

function calculateOverallScore(verification, duplication, coordinates) {
  let score = 0;
  let weights = 0;

  if (verification?.verification?.verificationScore) {
    score += verification.verification.verificationScore * 0.6;
    weights += 0.6;
  }

  if (duplication?.fraud) {
    const fraudScore = 100 - duplication.fraud.duplicateLikelihood;
    score += fraudScore * 0.25;
    weights += 0.25;
  }

  if (coordinates?.valid) {
    score += 100 * 0.15;
    weights += 0.15;
  }

  return Math.round(score / weights || 0);
}

function determineStatus(score) {
  if (score >= 80) return "APPROVED";
  if (score >= 60) return "APPROVED_WITH_REVIEW";
  if (score >= 40) return "NEEDS_REVIEW";
  return "REJECTED";
}
