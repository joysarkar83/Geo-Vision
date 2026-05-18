# 🧪 How to Test & Verify the AI System

## System Overview (Simple)

```
Frontend (React)
    ↓ (User uploads document)
DocumentAnalyzer Component
    ↓ (Click "Extract Data")
useAI Hook
    ↓ (HTTP POST request)
Backend Express API
    ↓ (GET OPENAI_API_KEY from .env)
Services (documentExtraction.js)
    ↓ (Convert file to Base64)
OpenAI API (gpt-4-vision-preview)
    ↓ (Extract data from image)
Response back to Frontend
    ↓
Display extracted information
```

---

## ✅ Step-by-Step Testing Guide

### STEP 1: Verify Backend is Running

```bash
# Terminal 1: Check backend status
cd backend
npm run dev

# Expected output:
# [nodemon] starting `node server.js`
# Server is running on http://localhost:3000
# ✅ AI Configuration validated
```

**If you see error:** Check `.env` file has OPENAI_API_KEY

---

### STEP 2: Verify Frontend is Running

```bash
# Terminal 2: Check frontend status
cd frontend
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ✅ Frontend ready
```

---

### STEP 3: Test AI Health Check (Terminal 3)

```bash
# Check if AI services are available
curl http://localhost:3000/ai/health

# Expected response:
# {"status":"ok","services":{"documentExtraction":"enabled","landVerification":"enabled","fraudDetection":"enabled"}}

# ✅ All services enabled!
```

---

### STEP 4: Test Document Extraction (File Upload)

**Using Frontend UI:**

1. Open http://localhost:5173 in browser
2. Go to "Add Land" page (or wherever you add DocumentAnalyzer)
3. Click "Upload Document"
4. Select a property document image (JPG, PNG, or PDF)
5. Click "🔍 Extract Data"
6. **Wait 10-20 seconds** for AI to process
7. Check the extracted information

**Check Browser Console (F12):**
```
Look for:
✅ Success: Document extracted
✅ Response shows: ownerName, landArea, address, confidence, etc.
```

**Check Backend Logs:**
```
Look for:
✅ POST /ai/extract-document 200 OK
✅ Response includes extracted data
```

---

### STEP 5: Test Using cURL (Manual API Test)

```bash
# Option A: Test with a local image file

# Create a test directory
mkdir -p test
cd test

# Use any JPG/PNG file, or download a sample
# Then run:
curl -X POST \
  -F "document=@your-image.jpg" \
  http://localhost:3000/ai/extract-document

# Expected response:
# {
#   "success": true,
#   "extracted": {
#     "ownerName": "extracted name",
#     "landArea": "extracted area",
#     "address": "extracted address",
#     "confidence": 92,
#     "alerts": []
#   }
# }
```

---

### STEP 6: Test Document Verification

**Frontend UI:**
1. Upload same document
2. Click "✅ Verify Authenticity"
3. Wait 10-15 seconds
4. See authenticity score (0-100%)

**Using cURL:**
```bash
curl -X POST \
  -F "document=@your-image.jpg" \
  -F "docType=land_deed" \
  http://localhost:3000/ai/verify-document

# Expected response:
# {
#   "success": true,
#   "verification": {
#     "authenticityScore": 95,
#     "isLikelyAuthentic": true,
#     "recommendation": "APPROVE"
#   }
# }
```

---

### STEP 7: Test Full Land Verification

**Using cURL:**
```bash
curl -X POST http://localhost:3000/ai/full-verification \
  -H "Content-Type: application/json" \
  -d '{
    "landData": {
      "address": "123 Main Street, Bangalore",
      "landArea": 2.5,
      "regNum": "KA/BNG/2024/12345",
      "pan": "ABCDE1234F",
      "propertyValue": 50,
      "landmark": "Near School",
      "coordinates": [[21.13016, 81.76137]]
    },
    "documentsExtracted": {
      "ownerName": "John Doe",
      "landArea": "2.5 acres",
      "confidence": 95
    }
  }'

# Expected response:
# {
#   "success": true,
#   "verificationReport": {
#     "overallScore": 85,
#     "status": "APPROVED_WITH_REVIEW",
#     "checks": {
#       "verification": {...},
#       "duplicateDetection": {...},
#       "coordinates": {...}
#     }
#   }
# }
```

---

## 🔍 Monitoring & Debugging

### Check Backend Logs in Real-Time

```bash
# Terminal where backend is running (should show all requests)

# You'll see logs like:
POST /ai/extract-document 200 OK ✅
[OpenAI API Response] Extracted 5 fields
POST /ai/full-verification 200 OK ✅
```

---

### Check Browser Console for Errors

```bash
# Open browser (http://localhost:5173)
Press F12 → Console tab

# Look for:
❌ Error messages (red)
✅ Success messages
📊 Response data
```

---

### Check OpenAI API Usage

```bash
# Go to https://platform.openai.com/account/usage
# You'll see:
- How many requests made
- Total tokens used
- Estimated cost (~$0.01-0.05 per extraction)
```

---

## 🧩 Component Testing Checklist

### Frontend Components

```javascript
// Test DocumentAnalyzer Component
✅ File upload works
✅ File validation works (JPG, PNG, PDF only)
✅ Extract Data button works
✅ Verify Authenticity button works
✅ Shows extracted data
✅ Shows error messages if API fails

// Test AIValuation Component
✅ Displays verification report
✅ Shows overall score
✅ Shows status badge (APPROVED/NEEDS_REVIEW/REJECTED)
✅ Shows all verification checks
✅ Responsive on mobile
```

### Backend Routes

```bash
# Test each route
✅ GET /ai/health → Returns service status
✅ POST /ai/extract-document → Extracts text from image
✅ POST /ai/verify-document → Checks authenticity
✅ POST /ai/analyze-land → Generates verification score
✅ POST /ai/check-duplicate → Detects fraud
✅ POST /ai/verify-coordinates → Validates location
✅ POST /ai/full-verification → Runs all checks
```

---

## 🐛 Troubleshooting Guide

### Problem: "OPENAI_API_KEY not configured"

**Solution:**
```bash
# Check .env file
cat backend/.env

# Should have:
OPENAI_API_KEY=sk-proj-...

# If empty, add your key:
echo "OPENAI_API_KEY=sk-proj-your-key-here" >> backend/.env

# Restart backend
npm run dev
```

---

### Problem: "File upload fails"

**Check:**
1. File size < 10MB
2. File format is JPG, PNG, or PDF
3. Image is clear and readable
4. Try uploading a different image

---

### Problem: "Extraction takes too long (> 30 seconds)"

**Reasons:**
1. First request is slower (warming up)
2. OpenAI API is slow (normal)
3. Large document (try smaller image)

**Solution:**
1. Wait up to 30 seconds
2. Check backend logs for errors
3. Try smaller document

---

### Problem: "Extraction returns no data"

**Check:**
1. Document quality (blur/low resolution)
2. Image has actual text/data
3. Try a different document
4. Check backend logs for error details

**Debug:**
```bash
# Check backend logs
npm run dev

# Add console.log to debug
# Edit: backend/services/documentExtraction.js
console.log("OpenAI Response:", data.choices[0].message.content);
```

---

### Problem: "CORS error in browser"

**Solution:**
Backend CORS is already configured. If still error:
```bash
# Clear browser cache
Press Ctrl+Shift+Delete → Clear cache
# Or Open in incognito window
```

---

## 📊 End-to-End Test Flow

### Complete Test Scenario (15 minutes)

```
1. Start Backend (2 min)
   cd backend
   npm run dev
   ✅ See "Server running on port 3000"

2. Start Frontend (2 min)
   cd frontend
   npm run dev
   ✅ See "Local: http://localhost:5173"

3. Test Health Check (1 min)
   curl http://localhost:3000/ai/health
   ✅ Returns {"status":"ok",...}

4. Test Document Upload (5 min)
   - Open http://localhost:5173
   - Go to Add Land page
   - Upload property document
   - Click Extract Data
   - ✅ See extracted information

5. Test Document Verification (3 min)
   - Upload same document
   - Click Verify Authenticity
   - ✅ See authenticity score

6. Test Full Verification (5 min)
   - Fill in land form
   - Click "Verify with AI"
   - ✅ See verification report with score

7. Monitor Costs (1 min)
   - Check OpenAI usage dashboard
   - ✅ See API calls and tokens used
```

---

## 🎯 Success Criteria

### All Systems Working ✅

- [ ] Backend server starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] AI health check returns success
- [ ] Document extraction works (returns extracted data)
- [ ] Document verification works (returns authenticity score)
- [ ] Full verification works (returns comprehensive report)
- [ ] No CORS errors in browser
- [ ] API calls visible in browser network tab
- [ ] OpenAI API dashboard shows usage
- [ ] Everything completes in < 30 seconds

---

## 🔗 Key Files to Monitor During Testing

```
Backend Logs:
backend/server.js → console output

Frontend Logs:
Browser Console (F12)

API Requests:
Browser Network Tab (F12 → Network)

Error Details:
- Backend: Check server.js logs
- Frontend: Check browser console
- API: Check OpenAI error response
```

---

## 📈 Performance Expectations

```
Operation                 | Time      | Cost
--------------------------|-----------|--------
Document Extraction       | 10-15 sec | ~$0.01
Document Verification    | 8-12 sec  | ~$0.01
Full Verification        | 15-20 sec | ~$0.05
Complete workflow        | 15-20 sec | ~$0.05

✅ All operations are async (non-blocking)
✅ Suitable for production use
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. ✅ Integrate DocumentAnalyzer into AddLand.jsx
2. ✅ Integrate AIValuation into AdminVerification.jsx
3. ✅ Test end-to-end with real data
4. ✅ Deploy to production
5. ✅ Monitor API usage & costs
6. ✅ Gather user feedback

---

## 💡 Quick Test Command

```bash
# Run this to test everything quickly
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Terminal 3:
curl http://localhost:3000/ai/health && echo "✅ Backend OK"
curl http://localhost:3000/ && echo "✅ API OK"

# Open browser:
http://localhost:5173
# Test document upload manually
```

---

**Test Status:** Ready to begin! 🚀
**Last Updated:** May 18, 2026
