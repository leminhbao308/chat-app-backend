import StatusConstant from "../constants/status.constant.js";
import ResponseUtil from "../utils/response.util.js";
import repos from "../repos/index.js";

const MediaController = {
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtil.badRequestResponse("No file uploaded")
                );
            }

            const fileUrl = await repos.s3.uploadFile(req.file);

            if (!fileUrl) {
                return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                    ResponseUtil.serverErrorResponse("Error upload file to server")
                );
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtil.successResponse("Upload successfully",
                    {
                        url: fileUrl,
                        name: req.file.originalname,
                        type: req.file.mimetype,
                        size: req.file.size
                    }
                ));
        } catch (error) {
            console.error("Error uploading file:", error);
            return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtil.serverErrorResponse("Server error while uploading files")
            );
        }
    },

    async uploadFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtil.badRequestResponse("No file uploaded")
                );
            }

            const uploadedFiles = [];
            for (const file of req.files) {
                const fileUrl = await repos.s3.uploadFile(file);
                if (fileUrl) {
                    uploadedFiles.push({
                        url: fileUrl,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size
                    });
                }
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtil.listResponse("Upload successfully",
                    uploadedFiles, uploadedFiles.length
                ));
        } catch (error) {
            console.error("Error uploading file:", error);
            return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtil.serverErrorResponse("Server error while uploading files")
            );
        }
    }
}

export default MediaController;
