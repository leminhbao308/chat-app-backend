import {MongoClient, ObjectId} from 'mongodb';
import DatabaseConstant from '../constants/database.constant.js';

class MongoHelper {
    constructor() {
        this.client = null;
        this.db = null;
        this.connectionPromise = null;
    }

    extractObjectId(stringIdOrObjectId) {
        return stringIdOrObjectId instanceof ObjectId
            ? stringIdOrObjectId
            : ObjectId.createFromHexString(stringIdOrObjectId);
    }

    /**
     * Kết nối đến MongoDB
     * @returns {Promise<Db>}
     */
    async connect() {
        try {
            // If we already have a connection promise pending, return it
            if (this.connectionPromise) return this.connectionPromise;

            // If we're already connected, return the db
            if (this.client && this.db) return this.db;

            this.connectionPromise = new Promise(async (resolve, reject) => {
                try {
                    const uri = DatabaseConstant.MONGO_URI
                        .replace("{u}", DatabaseConstant.MONGO_USERNAME)
                        .replace("{p}", DatabaseConstant.MONGO_PASSWORD);

                    // Configure connection pooling
                    const options = {
                        maxPoolSize: DatabaseConstant.MONGO_POOL_SIZE,
                        maxIdleTimeMS: DatabaseConstant.MONGO_MAX_IDLE_TIME_MS,
                        connectTimeoutMS: DatabaseConstant.MONGO_CONNECT_TIMEOUT_MS,
                    };

                    this.client = await MongoClient.connect(uri, options);
                    this.db = this.client.db(DatabaseConstant.DATABASE_NAME);

                    // Set up connection event listeners
                    this.client.on('error', (err) => {
                        console.error('MongoDB connection error:', err);
                    });

                    this.client.on('timeout', () => {
                        console.warn('MongoDB connection timeout');
                    });

                    resolve(this.db);
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
     * Đóng kết nối MongoDB
     * @returns {Promise<void>}
     */
    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.connectionPromise = null;
        }
    }

    /**
     * Kiểm tra trạng thái kết nối MongoDB
     * @returns {boolean}
     */
    isConnected() {
        return !!this.client && !!this.db;
    }

    /**
     * Thêm một document vào collection
     * @param {string} collectionName Tên collection
     * @param {Object} document Document cần thêm
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async insertOne(collectionName, document) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).insertOne(document);
    }

    /**
     * Thêm nhiều document vào collection
     * @param {string} collectionName Tên collection
     * @param {Array<Object>} documents Danh sách document cần thêm
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async insertMany(collectionName, documents) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).insertMany(documents);
    }

    /**
     * Tìm một document theo điều kiện
     * @param {string} collectionName Tên collection
     * @param {Object} query Điều kiện tìm kiếm
     * @param {Object} options Các tùy chọn
     * @returns {Promise<any>} Document tìm được hoặc null
     */
    async findOne(collectionName, query, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).findOne(query, options);
    }

    /**
     * Tìm nhiều document theo điều kiện
     * @param {string} collectionName Tên collection
     * @param {Object} query Điều kiện tìm kiếm
     * @param {Object} options Các tùy chọn
     * @returns {Promise<Array>} Danh sách documents
     */
    async find(collectionName, query, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).find(query, options).toArray();
    }

    /**
     * Cập nhật một document
     * @param {string} collectionName Tên collection
     * @param {Object} filter Điều kiện tìm document
     * @param {Object} update Nội dung cập nhật
     * @param {Object} options Các tùy chọn
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async updateOne(collectionName, filter, update, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).updateOne(filter, update, options);
    }

    /**
     * Cập nhật nhiều document
     * @param {string} collectionName Tên collection
     * @param {Object} filter Điều kiện tìm document
     * @param {Object} update Nội dung cập nhật
     * @param {Object} options Các tùy chọn
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async updateMany(collectionName, filter, update, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).updateMany(filter, update, options);
    }

    /**
     * Xóa một document
     * @param {string} collectionName Tên collection
     * @param {Object} filter Điều kiện tìm document
     * @param {Object} options Các tùy chọn
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async deleteOne(collectionName, filter, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).deleteOne(filter, options);
    }

    /**
     * Xóa nhiều document
     * @param {string} collectionName Tên collection
     * @param {Object} filter Điều kiện tìm document
     * @param {Object} options Các tùy chọn
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async deleteMany(collectionName, filter, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).deleteMany(filter, options);
    }

    /**
     * Đếm số lượng document thỏa mãn điều kiện
     * @param {string} collectionName Tên collection
     * @param {Object} query Điều kiện tìm kiếm
     * @param {Object} options Các tùy chọn
     * @returns {Promise<number>} Số lượng document
     */
    async count(collectionName, query, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).countDocuments(query, options);
    }

    /**
     * Tạo index cho collection
     * @param {string} collectionName Tên collection
     * @param {Object} fields Các trường cần tạo index
     * @param {Object} options Các tùy chọn
     * @returns {Promise<string>} Tên index được tạo
     */
    async createIndex(collectionName, fields, options = {}) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        return this.db.collection(collectionName).createIndex(fields, options);
    }

    /**
     * Kiểm tra và tạo collection nếu chưa tồn tại
     * @param {string} collectionName Tên collection
     * @returns {Promise<boolean>} True nếu collection được tạo mới
     */
    async createCollectionIfNotExists(collectionName) {
        if (!this.isConnected()) {
            console.warn('No MongoDB connection established.');
            console.warn('Trying to reconnect...')
            await this.connect();
        }
        const collections = await this.db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
            await this.db.createCollection(collectionName);
            return true;
        }

        return false;
    }
}

// Singleton instance
const mongoHelper = new MongoHelper();
export default mongoHelper;
