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


// CREATE FOLDER
export async function createFolder(folderName) {

    const response = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder"
        }
    });

    return response.data.id;
}


// UPLOAD FILE INTO FOLDER
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