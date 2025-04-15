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
}

export default S3Repo
