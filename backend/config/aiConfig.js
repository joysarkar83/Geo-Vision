import dotenv from "dotenv";

dotenv.config();

export const aiConfig = {
  // OpenAI Configuration
  openAI: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    modelText: "gpt-4o",
  },

  // Google Vision Configuration
  googleVision: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  // Claude Configuration (Alternative to OpenAI)
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: "claude-3-opus-20240229",
  },

  // Feature Flags
  features: {
    documentOCR: process.env.AI_OCR_ENABLED === "true" || true,
    landVerification: process.env.AI_VERIFICATION_ENABLED === "true" || true,
    priceValuation: process.env.AI_VALUATION_ENABLED === "true" || false,
    fraudDetection: process.env.AI_FRAUD_ENABLED === "true" || false,
  },
};

// Validate configuration
export function validateAIConfig() {
  const errors = [];

  if (!aiConfig.openAI.apiKey) {
    errors.push("OPENAI_API_KEY not set in .env");
  }

  if (errors.length > 0) {
    console.warn("⚠️  AI Configuration Warnings:", errors);
  }

  return errors.length === 0;
}
