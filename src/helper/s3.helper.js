import {CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import {Readable} from 'stream';
import S3Constant from '../constants/s3.constant.js';
import crypto from "crypto";

class S3Helper {
    constructor() {
        this.client = null;
        this.connectionPromise = null;
    }

    /**
     * Kết nối đến AWS S3
     * @returns {Promise<S3Client>}
     */
    async connect() {
        try {
            // If we already have a connection promise pending, return it
            if (this.connectionPromise) return this.connectionPromise;

            // If we're already connected, return the client
            if (this.client) return this.client;

            this.connectionPromise = new Promise(async (resolve, reject) => {
                try {
                    const options = {
                        region: S3Constant.REGION,
                        credentials: {
                            accessKeyId: S3Constant.ACCESS_KEY_ID,
                            secretAccessKey: S3Constant.SECRET_ACCESS_KEY
                        },
                        maxAttempts: S3Constant.MAX_ATTEMPTS || 3,
                    };

                    this.client = new S3Client(options);
                    resolve(this.client);
                } catch (error) {
                    this.connectionPromise = null;
                    reject(error);
                }
            });

            return this.connectionPromise;
        } catch (error) {
            this.connectionPromise = null;
            throw error;
        }
    }

    /**
     * Kiểm tra trạng thái kết nối S3Client
     * @returns {boolean}
     */
    isConnected() {
        return !!this.client;
    }

    /**
     * Đóng kết nối S3Client
     * @returns {Promise<void>}
     */
    async close() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.connectionPromise = null;
        }
    }

    /**
     * Tải tệp tin lên S3
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @param {Buffer|Readable|string} fileContent Nội dung tệp tin
     * @param {Object} metadata Metadata của tệp tin
     * @param {Object} options Các tùy chọn bổ sung
     * @returns {Promise<Object>} Thông tin về object đã tải lên
     */
    async uploadFile(bucketName, key, fileContent, metadata = {}, options = {}) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        // Xác định content type dựa trên phần mở rộng của file
        const contentType = options.contentType || this.getContentTypeByExtension(key);

        // Chuẩn bị dữ liệu cho upload
        let body;
        if (typeof fileContent === 'string' && fs.existsSync(fileContent)) {
            // Nếu fileContent là đường dẫn file
            body = fs.readFileSync(fileContent);
        } else {
            body = fileContent;
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Key: key,
            Body: body,
            Metadata: metadata,
            ContentType: contentType,
            ...options
        };

        const command = new PutObjectCommand(params);
        const result = await this.client.send(command);

        return {
            key,
            bucketName: params.Bucket,
            eTag: result.ETag,
            versionId: result.VersionId,
        };
    }

    /**
     * Tải xuống tệp tin từ S3
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @param {string} [outputPath] Đường dẫn lưu file (tùy chọn)
     * @returns {Promise<Buffer|string>} Nội dung file hoặc đường dẫn lưu file
     */
    async downloadFile(bucketName, key, outputPath = null) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Key: key
        };

        const command = new GetObjectCommand(params);
        const response = await this.client.send(command);

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Save file to disk if outputPath is provided
        if (outputPath) {
            const directory = path.dirname(outputPath);

            // Create directory if it doesn't exist
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, {recursive: true});
            }

            fs.writeFileSync(outputPath, buffer);
            return outputPath;
        }

        // Return buffer if no outputPath
        return buffer;
    }

    /**
     * Tạo URL công khai cho object trên S3 (chỉ hoạt động với bucket/object có cấu hình public access)
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @returns {string} Public URL
     */
    getPublicUrl(bucketName, key) {
        const bucket = bucketName || S3Constant.DEFAULT_BUCKET;
        const region = S3Constant.REGION;

        // Lưu ý: URL này chỉ hoạt động nếu object đã được cấu hình để cho phép truy cập công khai
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    /**
     * Tạo URL có chữ ký cho object trên S3
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @param {number} expiresIn Thời gian hiệu lực của URL (giây)
     * @param {string} [operation='getObject'] Loại thao tác ('getObject' hoặc 'putObject')
     * @returns {Promise<string>} Signed URL
     */
    async getSignedUrl(bucketName, key, expiresIn = 3600, operation = 'getObject') {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Key: key
        };

        let command;
        if (operation === 'putObject') {
            command = new PutObjectCommand(params);
        } else {
            command = new GetObjectCommand(params);
        }

        return getSignedUrl(this.client, command, {expiresIn});
    }

    /**
     * Xóa một object trong S3
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @returns {Promise<Object>} Kết quả từ S3
     */
    async deleteFile(bucketName, key) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Key: key
        };

        const command = new DeleteObjectCommand(params);
        return this.client.send(command);
    }

    /**
     * Xóa nhiều objects trong S3
     * @param {string} bucketName Tên bucket
     * @param {Array<string>} keys Danh sách các keys
     * @returns {Promise<Object>} Kết quả từ S3
     */
    async deleteFiles(bucketName, keys) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        // S3 DeleteObjects API chỉ cho phép xóa tối đa 1000 keys mỗi lần
        const chunkSize = 1000;
        const results = [];

        // Chia danh sách keys thành các nhóm nhỏ hơn
        for (let i = 0; i < keys.length; i += chunkSize) {
            const chunkKeys = keys.slice(i, i + chunkSize);

            const params = {
                Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
                Delete: {
                    Objects: chunkKeys.map(key => ({Key: key})),
                    Quiet: false
                }
            };

            const command = new DeleteObjectCommand(params);
            const result = await this.client.send(command);
            results.push(result);
        }

        return results;
    }

    /**
     * Liệt kê các objects trong bucket
     * @param {string} bucketName Tên bucket
     * @param {string} [prefix=''] Tiền tố cho key
     * @param {number} [maxKeys=1000] Số lượng keys tối đa trả về
     * @returns {Promise<Array>} Danh sách các objects
     */
    async listFiles(bucketName, prefix = '', maxKeys = 1000) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Prefix: prefix,
            MaxKeys: maxKeys
        };

        const command = new ListObjectsV2Command(params);
        const data = await this.client.send(command);

        return data.Contents || [];
    }

    /**
     * Kiểm tra một object có tồn tại trong S3 không
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @returns {Promise<boolean>} true nếu object tồn tại
     */
    async fileExists(bucketName, key) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        try {
            const params = {
                Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
                Key: key
            };

            const command = new HeadObjectCommand(params);
            await this.client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Sao chép một object từ source đến destination
     * @param {string} sourceBucket Bucket nguồn
     * @param {string} sourceKey Key nguồn
     * @param {string} destBucket Bucket đích
     * @param {string} destKey Key đích
     * @param {Object} options Các tùy chọn bổ sung
     * @returns {Promise<Object>} Kết quả từ S3
     */
    async copyFile(sourceBucket, sourceKey, destBucket, destKey, options = {}) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: destBucket || S3Constant.DEFAULT_BUCKET,
            CopySource: `${sourceBucket || S3Constant.DEFAULT_BUCKET}/${sourceKey}`,
            Key: destKey,
            ...options
        };

        const command = new CopyObjectCommand(params);
        return this.client.send(command);
    }

    /**
     * Lấy thông tin của một object
     * @param {string} bucketName Tên bucket
     * @param {string} key Key của object
     * @returns {Promise<Object>} Thông tin của object
     */
    async getFileInfo(bucketName, key) {
        if (!this.isConnected()) {
            console.warn('No S3 connection established.');
            console.warn('Trying to reconnect...');
            await this.connect();
        }

        const params = {
            Bucket: bucketName || S3Constant.DEFAULT_BUCKET,
            Key: key
        };

        const command = new HeadObjectCommand(params);
        return this.client.send(command);
    }

    /**
     * Xác định Content-Type dựa trên phần mở rộng của file
     * @param {string} filename Tên file
     * @returns {string} Content-Type
     */
    getContentTypeByExtension(filename) {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.mp3': 'audio/mpeg',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.zip': 'application/zip',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }

    generateFileName(originName) {
        const random = crypto.randomBytes(2).toString('hex');
        const now = new Date();

        // Đảm bảo các số có hai chữ số
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() trả về 0-11
        const year = now.getFullYear();

        const timestamp = `${hours}${minutes}${seconds}-${day}${month}${year}`;

        return `${random}-${timestamp}-${path.basename(originName)}`;
    }
}

// Singleton instance
const s3Helper = new S3Helper();
export default s3Helper;
