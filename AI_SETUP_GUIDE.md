# AI Integration Setup Guide for Geo-Vision

## 🚀 Quick Start - AI Features Added

### What's New?
✅ **Document OCR** - Automatically extract data from property documents  
✅ **Document Authentication** - Verify document genuineness  
✅ **Land Verification AI** - Generate verification scores for listings  
✅ **Fraud Detection** - Detect duplicate/suspicious listings  
✅ **Coordinate Verification** - Validate property locations  

---

## 📋 Setup Instructions

### 1. Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Click on your profile → API keys
4. Create a new API key
5. Copy the key

#### Step 3: Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your values
# nano .env  (Linux/Mac)
# notepad .env  (Windows)
```

**Fill in these values:**
```
OPENAI_API_KEY=sk-your-key-here
MONGO_URI=mongodb://localhost:27017/geovision
JWT_SECRET=your-secret-key-here
```

#### Step 4: Start Backend
```bash
npm run dev
# or
nodemon server.js
```

---

### 2. Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Start Frontend
```bash
npm run dev
```

---

## 🔌 API Endpoints Overview

### Document Analysis
```
POST /ai/extract-document
- Upload a document image/PDF
- Returns extracted data (name, address, land area, etc.)

POST /ai/verify-document
- Verify document authenticity
- Returns authenticity score & flags
```

### Land Verification
```
POST /ai/analyze-land
- Analyze a land listing for verification
- Checks consistency, risk factors, document quality

POST /ai/check-duplicate
- Detect duplicate/suspicious listings
- Returns fraud risk level

POST /ai/verify-coordinates
- Validate land coordinates
- Checks geographic validity

POST /ai/full-verification
- Complete verification workflow
- Returns comprehensive verification report
```

---

## 💻 Frontend Components

### `DocumentAnalyzer.jsx`
Drag-and-drop document upload with OCR
```jsx
import DocumentAnalyzer from './components/DocumentAnalyzer';

<DocumentAnalyzer 
  onExtract={(data) => console.log(data)}
  onVerify={(verification) => console.log(verification)}
/>
```

### `AIValuation.jsx`
Display AI verification reports
```jsx
import AIValuation from './components/AIValuation';

<AIValuation verificationReport={report} />
```

### `useAI` Hook
Easy API integration
```jsx
import useAI from './hooks/useAI';

const { extractDocument, verifyDocument, loading, error } = useAI();

await extractDocument(file);
```

---

## 📊 Integration Points

### In AddLand.jsx (Land Submission)
1. Add `DocumentAnalyzer` component for document upload
2. Extract data automatically with AI
3. Verify coordinates
4. Run full verification before submission

### In AdminVerification.jsx (Admin Panel)
1. Display AI verification report for pending lands
2. Show risk scores and fraud detection results
3. Allow admin to override AI decisions

### In Dashboard.jsx (Marketplace)
1. Filter lands by verification score
2. Show trust badges based on AI verification

---

## 🛠️ Troubleshooting

### "OpenAI API key not configured"
- Check `.env` file has `OPENAI_API_KEY`
- Restart backend after updating `.env`

### "Failed to extract document"
- Ensure file is image (JPG, PNG) or PDF
- File size must be < 10MB
- Check OpenAI API quota

### CORS Errors
- Backend CORS is configured for `*`
- Check backend is running on port 3000

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Or update `MONGO_URI` in `.env`

---

## 💰 Pricing & Limits

### OpenAI API (Recommended)
- **GPT-4 Vision**: $0.03 per 1K tokens (document analysis)
- **GPT-4 Turbo**: $0.01 per 1K tokens (verification)
- Free tier: $5 credit

### Estimates
- Document extraction: ~0.5-1 cent per document
- Land verification: ~2-3 cents per land
- Full workflow: ~5 cents per land listing

---

## 🚦 Next Steps

1. ✅ Set up backend with OpenAI key
2. ✅ Start backend server
3. ✅ Start frontend dev server
4. 🔄 Add DocumentAnalyzer to AddLand.jsx
5. 🔄 Add AIValuation to AdminVerification.jsx
6. 🔄 Test document extraction
7. 🔄 Test land verification

---

## 📚 Additional Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vision API Guide](https://platform.openai.com/docs/guides/vision)
- [GPT-4 Turbo Docs](https://platform.openai.com/docs/models/gpt-4-turbo)

---

## 🎯 Future Enhancements

Phase 2 Coming Soon:
- 🏠 Property price valuation with ML model
- 🔍 Smart search with NLP
- 💬 AI chatbot for user support
- 📈 Market trend analysis
