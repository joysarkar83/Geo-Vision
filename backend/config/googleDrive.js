import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({
    version: "v3",
    auth
});

const ROOT_FOLDER = "1HKW0fjKdcHpepYcfawdor8KqPwUdxqKw";

export async function createSubmissionFolder() {

    const folderName = `Land_${Date.now()}`;

    const folder = await drive.files.create({
        requestBody: {
            name: file.originalname,
            parents: [ROOT_FOLDER]
        },
        media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        }
    });

    return folder.data.id;
}

export async function uploadFile(file, folderId) {

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