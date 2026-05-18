# AI Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐                     │  │
│  │  │  AddLand.jsx │  │AdminVerif... │                     │  │
│  │  └──────┬───────┘  └──────┬───────┘                     │  │
│  └─────────┼──────────────────┼──────────────────────────────┘  │
│            │                  │                                 │
│  ┌─────────▼──────────────────▼──────────────────────────────┐  │
│  │  Components                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐               │  │
│  │  │DocumentAnalyzer │  │ AIValuation     │               │  │
│  │  │ (OCR upload)    │  │ (Report display)│               │  │
│  │  └────────┬────────┘  └────────┬────────┘               │  │
│  └───────────┼─────────────────────┼─────────────────────────┘  │
│              │                     │                           │
│  ┌───────────▼─────────────────────▼─────────────────────────┐  │
│  │  Hooks                                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │          useAI Hook                             │   │  │
│  │  │  - extractDocument()                            │   │  │
│  │  │  - verifyDocument()                             │   │  │
│  │  │  - analyzeLand()                                │   │  │
│  │  │  - fullVerification()                           │   │  │
│  │  └───────────────┬──────────────────────────────────┘   │  │
│  └────────────────────┼────────────────────────────────────┘  │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │ HTTP / JSON
                        │
              ┌─────────▼────────────────┐
              │  API Client (api.js)     │
              │  - extractDocumentData() │
              │  - verifyDocument()      │
              │  - performFullVerif...() │
              │  - checkDuplicate()      │
              └──────────┬────────────────┘
                         │ fetch() calls
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes: /ai/*                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  POST /ai/extract-document                        │ │   │
│  │  │  POST /ai/verify-document                         │ │   │
│  │  │  POST /ai/analyze-land                            │ │   │
│  │  │  POST /ai/check-duplicate                         │ │   │
│  │  │  POST /ai/verify-coordinates                      │ │   │
│  │  │  POST /ai/full-verification                       │ │   │
│  │  │  GET  /ai/health                                  │ │   │
│  │  └─────────────┬──────────────────────────────────────┘ │   │
│  └────────────────┼─────────────────────────────────────────┘   │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │  Services                                              │   │
│  │  ┌────────────────────┐  ┌──────────────────────────┐  │   │
│  │  │DocumentExtraction  │  │ LandVerification        │  │   │
│  │  │                    │  │                          │  │   │
│  │  │- extractData()     │  │- generateScore()        │  │   │
│  │  │- verifyAuth()      │  │- detectDuplicate()      │  │   │
│  │  │- extractText()     │  │- verifyCoord()          │  │   │
│  │  │- processBatch()    │  │- generateReport()       │  │   │
│  │  └────────┬───────────┘  └──────────┬──────────────┘  │   │
│  └───────────┼──────────────────────────┼───────────────────┘   │
│              │                          │                      │
│  ┌───────────▼──────────────────────────▼──────────────────┐   │
│  │  Config                                                │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         aiConfig.js                            │  │   │
│  │  │  - OPENAI_API_KEY (from .env)                  │  │   │
│  │  │  - Feature flags                                │  │   │
│  │  │  - Model configuration                          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └──────────────┬──────────────────────────────────────────┘   │
│                 │                                              │
└─────────────────┼──────────────────────────────────────────────┘
                  │
        ┌─────────▼──────────────┐
        │   External APIs        │
        │                        │
        │ ┌────────────────────┐ │
        │ │ OpenAI API         │ │
        │ │                    │ │
        │ │ - GPT-4 Vision     │ │
        │ │ - GPT-4 Turbo      │ │
        │ │ (document analysis,│ │
        │ │  verification)     │ │
        │ └────────────────────┘ │
        └────────────────────────┘
```

---

## Data Flow for Document Analysis

```
User uploads document
         │
         ▼
  DocumentAnalyzer
  (File validation)
         │
         ▼
  Extract Data Click
         │
         ├──► useAI.extractDocument()
         │
         ├──► POST /ai/extract-document
         │
         ├──► documentExtraction.js
         │
         ├──► OpenAI Vision API
         │    (OCR)
         │
         ├──► Parse JSON response
         │
         ├──► Return extracted data
         │    {
         │      ownerName: "...",
         │      landArea: "...",
         │      address: "...",
         │      confidence: 95,
         │      ...
         │    }
         │
         ▼
  Auto-fill form fields
  Display extracted data
```

---

## Data Flow for Land Verification

```
Submit land form
         │
         ▼
  handleVerifyWithAI()
         │
         ├──► Prepare landData object
         │
         ├──► performFullLandVerification()
         │
         ├──► POST /ai/full-verification
         │
         ├──► landVerification.js
         │
         ├──► Run parallel checks:
         │    ├─ generateVerificationScore()
         │    ├─ detectDuplicateLandings()
         │    └─ verifyCoordinates()
         │
         ├──► OpenAI APIs (multiple calls)
         │    ├─ Verify land authenticity
         │    ├─ Detect fraud
         │    └─ Validate location
         │
         ├──► generateVerificationReport()
         │
         ├──► Return comprehensive report:
         │    {
         │      overallScore: 85,
         │      status: "APPROVED",
         │      checks: {
         │        verification: {...},
         │        duplicateDetection: {...},
         │        coordinates: {...}
         │      }
         │    }
         │
         ▼
  AIValuation component
  displays report
```

---

## Component Integration Points

```
AddLand.jsx
│
├─ DocumentAnalyzer
│  ├─ Props: onExtract, onVerify
│  ├─ State: selectedFile, extractedData
│  └─ Calls: useAI()
│
├─ AIValuation
│  ├─ Props: verificationReport
│  └─ Displays: verification score, flags, recommendations
│
└─ Buttons:
   ├─ "🤖 Verify with AI" → handleVerifyWithAI()
   └─ "✅ Submit" → handleSubmit()


AdminVerification.jsx
│
├─ Land List (pending)
│
├─ Selected Land Details
│  │
│  ├─ Land Info Display
│  │
│  ├─ AIValuation
│  │  └─ Displays AI verification report
│  │
│  └─ Admin Actions:
│     ├─ "✅ Approve" → verifyLand()
│     └─ "❌ Reject" → rejectLandVerification()
```

---

## Environment & Dependencies

```
Frontend Dependencies
├─ React (existing)
├─ React Router (existing)
├─ Mapbox GL (existing)
└─ No new npm packages needed ✅

Backend Dependencies
├─ express (existing)
├─ mongoose (existing)
├─ dotenv (existing)
├─ multer (existing)
└─ node-fetch ❌ (not needed, using global fetch)

New Environment Variables
├─ OPENAI_API_KEY (required)
├─ MONGO_URI (existing)
├─ JWT_SECRET (existing)
└─ Feature flags (optional)
```

---

## API Response Examples

### Document Extraction Response
```json
{
  "success": true,
  "extracted": {
    "ownerName": "Raj Kumar",
    "landArea": "2.5 acres",
    "address": "123 Main Street, Bangalore",
    "regNum": "KA/BNG/2024/12345",
    "pan": "ABCDE1234F",
    "dob": "1985-03-15",
    "confidence": 92,
    "alerts": []
  }
}
```

### Verification Report Response
```json
{
  "success": true,
  "verificationReport": {
    "overallScore": 82,
    "status": "APPROVED_WITH_REVIEW",
    "checks": {
      "verification": {
        "verification": {
          "verificationScore": 85,
          "status": "APPROVED",
          "consistencyCheck": {
            "dataMatches": true,
            "discrepancies": []
          }
        }
      },
      "duplicateDetection": {
        "fraud": {
          "isDuplicate": false,
          "duplicateLikelihood": 5,
          "fraudRiskLevel": "LOW"
        }
      },
      "coordinates": {
        "valid": true,
        "confidence": 0.95
      }
    }
  }
}
```

---

## Error Handling Flow

```
API Request
     │
     ▼
Validation Check
     │
     ├─ PASS ──► Process Request
     │            │
     │            ▼
     │         OpenAI API Call
     │            │
     │            ├─ SUCCESS ──► Return Result
     │            │
     │            └─ ERROR ────┐
     │                          │
     └─ FAIL ──────────────────┘
                                │
                                ▼
                           Error Response
                                {
                                  success: false,
                                  error: "description"
                                }
                                │
                                ▼
                           Frontend Error Handler
                           Display user-friendly message
```

---

## Performance Optimization

```
Sequential vs Parallel Processing

Sequential (slower):
1. Extract document
2. Wait for response
3. Verify document
4. Wait for response
5. Analyze land
6. Wait for response
Total: ~20 seconds

Parallel (faster) - Used in fullVerification:
1. Extract document  ┐
2. Verify document   ├─ Run simultaneously
3. Analyze land      ┘
4. Wait for all to complete
Total: ~15 seconds

✅ Used in fullVerification endpoint
✅ Better UX with faster responses
```

---

## Security Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React)                   │
│  - No API keys stored               │
│  - No sensitive data                │
└─────────────┬───────────────────────┘
              │
              │ HTTPS (Production)
              │
┌─────────────▼───────────────────────┐
│  Backend (Express)                  │
│                                     │
│  Middleware:                        │
│  ├─ CORS configured                 │
│  ├─ JWT authentication              │
│  ├─ Input validation                │
│  └─ Rate limiting (optional)        │
│                                     │
│  Environment Variables:             │
│  ├─ OPENAI_API_KEY (in .env)       │
│  ├─ JWT_SECRET (in .env)           │
│  └─ MONGO_URI (in .env)            │
│                                     │
│  ✅ Keys never exposed to client   │
│  ✅ Keys in .gitignore             │
└─────────────┬───────────────────────┘
              │
              │ API Key in header
              │
┌─────────────▼───────────────────────┐
│  OpenAI API (Secure)                │
│  - Key authentication               │
│  - Encrypted communication          │
│  - Rate limiting by OpenAI          │
└─────────────────────────────────────┘
```

---

## Scalability Considerations

```
Current Implementation
├─ Synchronous processing
├─ Single request per verification
└─ Suitable for: Moderate volume (100-1000/day)

Future Improvements
├─ Queue system (Bull, RabbitMQ)
├─ Batch processing
├─ Caching layer (Redis)
├─ Horizontal scaling
└─ Suitable for: High volume (10000+/day)

Cost Optimization
├─ Cache extraction results
├─ Batch similar requests
├─ Use GPT-3.5 for simple tasks
└─ Reduce API calls
```

---

## Monitoring & Logging

```
Metrics to Track
├─ API response times
├─ Extraction accuracy rates
├─ Verification score distribution
├─ Fraud detection accuracy
├─ Error rates
├─ API costs
└─ User feedback

Logging
├─ INFO: Request received
├─ DEBUG: Extraction results
├─ WARN: Low confidence score
├─ ERROR: API failures
└─ AUDIT: Admin overrides
```

---

**Architecture Last Updated:** May 18, 2026
**Version:** 1.0
**Status:** ✅ Complete
