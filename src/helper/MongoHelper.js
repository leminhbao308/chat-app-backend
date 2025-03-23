import {MongoClient} from 'mongodb';
import DatabaseConstant from '../constants/databaseConstant.js';

class MongoHelper {
    constructor () {
        this.client = null;
        this.db = null;
    }

    /**
     * Kết nối đến MongoDB
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            if (this.client) return this.db;

            this.client = await MongoClient.connect(
                DatabaseConstant.MONGO_URI
                    .replace("{u}", DatabaseConstant.MONGO_USERNAME)
                    .replace("{p}", DatabaseConstant.MONGO_PASSWORD)
            );
            this.db = this.client.db(DatabaseConstant.DATABASE_NAME);
            return this.db;
        } catch (error) {
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
            console.log('MongoDB connection closed');
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
     * Lấy instance db hiện tại
     * @returns {Db}
     */
    getDb() {
        if (!this.db) {
            throw new Error('No MongoDB connection established. Call connect() first.');
        }
        return this.db;
    }

    /**
     * Thêm một document vào collection
     * @param {string} collectionName Tên collection
     * @param {Object} document Document cần thêm
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async insertOne(collectionName, document) {
        await this.connect();
        return this.db.collection(collectionName).insertOne(document);
    }

    /**
     * Thêm nhiều document vào collection
     * @param {string} collectionName Tên collection
     * @param {Array<Object>} documents Danh sách document cần thêm
     * @returns {Promise<any>} Kết quả từ MongoDB
     */
    async insertMany(collectionName, documents) {
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
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
        await this.connect();
        return this.db.collection(collectionName).createIndex(fields, options);
    }

    /**
     * Kiểm tra và tạo collection nếu chưa tồn tại
     * @param {string} collectionName Tên collection
     * @returns {Promise<boolean>} True nếu collection được tạo mới
     */
    async createCollectionIfNotExists(collectionName) {
        await this.connect();
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
