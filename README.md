# Geo-Vision

Geo-Vision is a full stack land parcel intelligence platform that combines geospatial visualization, ownership workflows, and controlled buyer-seller contact exchange.

It allows authenticated users to register land parcels, upload supporting documents to Google Drive, visualize verified parcels on an interactive map, and manage contact approval requests between buyers and land owners.

## What's so special?

This project demonstrates practical, production-relevant engineering across:

- Full stack JavaScript application design with clear frontend and backend separation
- JWT based authentication and protected route handling
- Geospatial workflows using Leaflet and Turf.js
- Real world document pipeline integration with Google Drive API
- Data modeling for ownership, parcel records, and request approval lifecycle
- UI implementation with a modern responsive design system

## Product capabilities

### 1) Authentication and user identity

- User signup with unique Aadhaar, phone, and email constraints
- Secure password hashing with bcrypt
- Login with JWT token issuance
- Authenticated `/me` profile fetch for session aware UI

### 2) Land parcel registry

- Add land parcel details with owner linkage
- Capture coordinates as polygon points
- Track sale state (On Sale / Not for Sale)
- Track verification state (Pending / Verified)
- Store parcel metadata such as area, value, address, and landmark

### 3) Geospatial dashboard

- Interactive map rendering with React Leaflet
- User geolocation centering
- Region search using OpenStreetMap Nominatim
- Polygon overlay of verified parcels
- Turf based point in polygon check to identify active parcel region

### 4) Buyer request workflow

- Buyers can request seller contact access for a parcel
- Sellers can view incoming pending requests
- Sellers can approve requests
- Approved buyers can view seller contact details for that parcel

### 5) Document handling

- Multi file document upload from frontend
- Backend upload processing with Multer
- Auto created Google Drive submission folders
- Files stored remotely and linked back to parcel metadata

## Tech stack

### Frontend

- React 19
- React Router
- React Leaflet + Leaflet
- Turf.js
- Vite
- Tailwind CSS (plus custom theme styling)
- Axios and Fetch API

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Multer
- Google Drive API via `googleapis`
- dotenv

## Repository structure

```
Geo-Vision/
  backend/
    config/googleDrive.js
    models/
      User.js
      Land.js
      Request.js
    server.js
  frontend/
    src/
      api/api.js
      components/
      pages/
      utils/auth.js
```

## Core data models

### `User`

- `username`, `aadhar`, `phone`, `email`, `password`
- Unique constraints on Aadhaar, phone, and email

### `Land`

- `ownerId` reference to `User`
- Parcel metadata and coordinates (`[[lat, lng]]`)
- `sellingStatus`: 10 (On Sale), 11 (Not for Sale)
- `verificationStatus`: 0 (Pending), 1 (Verified)
- `documents` and `driveFolder` references for uploaded files

### `Request`

- `landId`, `buyerId`, `sellerId`
- `status`: pending, approved, rejected
- Tracks contact approval lifecycle

## API overview

Base URL: `http://localhost:3000`

### Public routes

- `POST /signup`
- `POST /login`
- `GET /land`
- `GET /land/:id`

### Protected routes (JWT required)

- `GET /me`
- `POST /land/add`
- `POST /land/upload-docs`
- `POST /request/contact`
- `GET /request/my`
- `POST /request/approve`
- `GET /request/check/:landId`

## Local setup

## 1) Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## 2) Configure environment variables

A `.env` file is included in the backend directory with placeholders:

```env
JWT_SECRET=replace-with-a-strong-secret
PORT=3000
```

Update `JWT_SECRET` before running in any shared or production-like environment.

## 3) Prepare MongoDB

The backend currently connects to:

`mongodb://127.0.0.1:27017/Geo-Vision`

Make sure a local MongoDB instance is running.

## 4) Configure Google Drive upload credentials

Place Google service account credentials in:

- `backend/credentials.json`

Also verify the parent Drive folder ID in:

- `backend/config/googleDrive.js` (`ROOT_FOLDER` constant)

## 5) Run the app

```bash
# Terminal 1: backend
cd backend
node server.js

# Terminal 2: frontend
cd frontend
npm run dev
```

Frontend default Vite URL is usually `http://localhost:5173`.

## Highlights

- Designed a complete CRUD-like land listing and discovery flow tied to authenticated identity
- Implemented domain specific approval logic that controls access to sensitive seller contact details
- Integrated map based parcel rendering and geospatial computation in a business workflow
- Built document ingestion from browser to cloud storage with backend orchestration
- Modeled real entity relationships with Mongoose references and query population
- Structured UI into reusable components and clean route based pages

