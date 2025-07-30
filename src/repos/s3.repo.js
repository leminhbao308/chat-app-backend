import fs from "fs";
import S3Constant from "../constants/s3.constant.js";
import s3Helper from "../helper/s3.helper.js";

const S3Repo = {
    uploadFile: async (file) => {
        try {
            // Get file detail
            const filePath = file.path;
            const fileContent = fs.readFileSync(filePath);

            // Determine folder based on file type
            let folder = S3Constant.FOLDERS.DOCUMENTS;
            if (file.mimetype.startsWith('image/')) {
                folder = S3Constant.FOLDERS.IMAGES;
            } else if (file.mimetype.startsWith('video/')) {
                folder = S3Constant.FOLDERS.VIDEOS;
            }

            // Create S3 key with folder structure
            const fileName = s3Helper.generateFileName(file.originalname)
            const key = `${folder}${fileName}`;

            // Prepare metadata
            const metadata = {
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size.toString(),
                uploadDate: new Date().toISOString()
            };

            // Upload to S3
            return await s3Helper.uploadFile(
                S3Constant.DEFAULT_BUCKET,
                key,
                fileContent,
                metadata
            ).then(() => {
                // Clean up local file after upload
                fs.unlinkSync(filePath);
                return s3Helper.getPublicUrl(S3Constant.DEFAULT_BUCKET, key);
            }).catch((err) => {
                console.error("Error uploading file: ", err);

                // Clean up local file if it exists
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return null
            })
        } catch (err) {
            console.error("Error uploading file: ", err)

            // Clean up local file if it exists
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return null;
        }
    },

    downloadFile: async (key) => {
        try {
            // Parse key to determine folder and filename
            return await s3Helper.downloadFile(
                S3Constant.DEFAULT_BUCKET,
                key
            );
        } catch (err) {
            console.error("Error downloading file:", err);
            return null;
        }
    },

    checkFileExists: async (key) => {
        try {
            return await s3Helper.fileExists(
                S3Constant.DEFAULT_BUCKET,
                key
            );
        } catch (err) {
            console.error("Error checking file existence:", err);
            return false;
        }
    },

    getFileInfo: async (key) => {
        try {
            return await s3Helper.getFileInfo(
                S3Constant.DEFAULT_BUCKET,
                key
            );
        } catch (err) {
            console.error("Error getting file info:", err);
            return null;
        }
    },

    getSignedUrl: async (key, expiresIn = 3600) => {
        try {
            return await s3Helper.getSignedUrl(
                S3Constant.DEFAULT_BUCKET,
                key,
                expiresIn
            );
        } catch (err) {
            console.error("Error generating signed URL:", err);
            return null;
        }
    },

    extractKeyFromUrl: async (url) => {
        return s3Helper.extractKeyFromUrl(url);
    },

    downloadFileByUrl: async (url) => {
        try {
            const key = s3Helper.extractKeyFromUrl(url);

            if (!key) {
                console.error("Could not extract key from URL:", url);
                return null;
            }

            return await S3Repo.downloadFile(key);
        } catch (err) {
            console.error("Error downloading file by URL:", err);
            return null;
        }
    }
}

export default S3Repo
