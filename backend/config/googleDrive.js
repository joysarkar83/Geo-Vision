import { google } from "googleapis";
import fs from "fs";
import path from "path";

let drive = null;
let driveInitialized = false;

// Try to initialize Google Drive
try {
    const credentialsPath = "credentials.json";
    if (fs.existsSync(credentialsPath)) {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ["https://www.googleapis.com/auth/drive"]
        });

        drive = google.drive({
            version: "v3",
            auth
        });
        driveInitialized = true;
        console.log("✅ Google Drive initialized successfully");
    } else {
        console.warn("⚠️  credentials.json not found - Google Drive upload disabled");
        driveInitialized = false;
    }
} catch (error) {
    console.warn("⚠️  Failed to initialize Google Drive:", error.message);
    driveInitialized = false;
}

const ROOT_FOLDER = "1HKW0fjKdcHpepYcfawdor8KqPwUdxqKw";

export async function createSubmissionFolder() {
    if (!driveInitialized) {
        // Return a mock folder ID for testing without Google Drive
        return `mock_folder_${Date.now()}`;
    }

    const folderName = `Land_${Date.now()}`;

    const folder = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [ROOT_FOLDER]
        }
    });

    return folder.data.id;
}

export async function uploadFile(file, folderId) {
    if (!driveInitialized) {
        // Return a mock file ID for testing without Google Drive
        return `mock_file_${Date.now()}_${file.originalname}`;
    }

    const response = await drive.files.create({
        requestBody: {
            name: file.originalname,
            parents: [folderId]
        },
        media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        }
    });

    return response.data.id;
}