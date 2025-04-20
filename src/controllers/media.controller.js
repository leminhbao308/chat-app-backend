import StatusConstant from "../constants/status.constant.js";
import ResponseUtil from "../utils/response.util.js";
import repos from "../repos/index.js";
import path from "path";

const MediaController = {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res
          .status(StatusConstant.BAD_REQUEST)
          .json(ResponseUtil.badRequestResponse("No file uploaded"));
      }

      const fileUrl = await repos.s3.uploadFile(req.file);

      if (!fileUrl) {
        return res
          .status(StatusConstant.INTERNAL_SERVER_ERROR)
          .json(
            ResponseUtil.serverErrorResponse("Error upload file to server")
          );
      }

      return res.status(StatusConstant.OK).json(
        ResponseUtil.successResponse("Upload successfully", {
          url: fileUrl,
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
        })
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return res
        .status(StatusConstant.INTERNAL_SERVER_ERROR)
        .json(
          ResponseUtil.serverErrorResponse("Server error while uploading files")
        );
    }
  },

  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(StatusConstant.BAD_REQUEST)
          .json(ResponseUtil.badRequestResponse("No file uploaded"));
      }

      const uploadedFiles = [];
      for (const file of req.files) {
        const fileUrl = await repos.s3.uploadFile(file);
        if (fileUrl) {
          uploadedFiles.push({
            url: fileUrl,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
          });
        }
      }

      return res
        .status(StatusConstant.OK)
        .json(
          ResponseUtil.listResponse(
            "Upload successfully",
            uploadedFiles,
            uploadedFiles.length
          )
        );
    } catch (error) {
      console.error("Error uploading file:", error);
      return res
        .status(StatusConstant.INTERNAL_SERVER_ERROR)
        .json(
          ResponseUtil.serverErrorResponse("Server error while uploading files")
        );
    }
  },

  async downloadFileByUrl(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res
          .status(StatusConstant.BAD_REQUEST)
          .json(ResponseUtil.badRequestResponse("File URL is required"));
      }

      // Trích xuất key từ URL
      const key = await repos.s3.extractKeyFromUrl(url);

      if (!key) {
        return res
          .status(StatusConstant.BAD_REQUEST)
          .json(ResponseUtil.badRequestResponse("Invalid file URL format"));
      }

      // Kiểm tra file có tồn tại không
      const fileExists = await repos.s3.checkFileExists(key);

      if (!fileExists) {
        return res
          .status(StatusConstant.NOT_FOUND)
          .json(ResponseUtil.notFoundResponse("File not found"));
      }

      // Get file details
      const fileInfo = await repos.s3.getFileInfo(key);

      // Download the file
      const fileBuffer = await repos.s3.downloadFile(key);

      if (!fileBuffer) {
        return res
          .status(StatusConstant.INTERNAL_SERVER_ERROR)
          .json(
            ResponseUtil.serverErrorResponse(
              "Error downloading file from server"
            )
          );
      }

      // Set response headers
      res.setHeader(
        "Content-Type",
        fileInfo.ContentType || "application/octet-stream"
      );
      let originalName = fileInfo.Metadata?.originalName || path.basename(key);

      // Nếu không có đuôi mở rộng → thêm thủ công theo Content-Type
      if (!/\.[^/.]+$/.test(originalName)) {
        const contentType = fileInfo.ContentType;

        if (contentType.includes("pdf")) originalName += ".pdf";
        else if (contentType.includes("png")) originalName += ".png";
        else if (contentType.includes("jpeg")) originalName += ".jpg";
        else if (contentType.includes("msword")) originalName += ".doc";
       // zip file 
        else if (contentType.includes("zip")) originalName += ".zip";
        else if (contentType.includes("excel")) originalName += ".xlsx";
        else if (contentType.includes("officedocument.spreadsheetml.sheet"))
          originalName += ".xlsx";
        else if (contentType.includes("officedocument.wordprocessingml.document"))
          originalName += ".docx";
        else if (
          contentType.includes("officedocument.wordprocessingml.document")
        )
          originalName += ".docx";
        else if (contentType.includes("mp4")) originalName += ".mp4";
        else originalName += ".bin"; // fallback
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${originalName}"`
      );
      res.setHeader(
        "Content-Length",
        fileInfo.ContentLength || fileBuffer.length
      );

      // Send file buffer
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading file by URL:", error);
      return res
        .status(StatusConstant.INTERNAL_SERVER_ERROR)
        .json(
          ResponseUtil.serverErrorResponse(
            "Server error while downloading file"
          )
        );
    }
  },
};

export default MediaController;
