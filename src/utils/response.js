/**
 * Response utilities
 * Cung cấp các hàm chuẩn hóa response cho API
 */
import StatusConstant from '../constants/statusConstant.js';

const ResponseUtils = {

    /**
     * Base Response
     * @param {boolean} success - Trạng thái thành công của request
     * @param {string} describe - Mô tả ngắn gọn về kết quả
     * @param {number} status_code - Mã trạng thái HTTP
     * @param {object|null} content - Dữ liệu trả về
     * @returns {object} - Chuẩn response object
     */
    baseResponse(success, describe, status_code, content = null) {
        return {
            success,
            describe,
            status_code,
            content
        };
    },

    /**
     * Success Response
     * @param {string} describe - Mô tả ngắn gọn về kết quả
     * @param {object|null} content - Dữ liệu trả về
     * @returns {object} - Chuẩn response object
     */
    successResponse(describe, content = null) {
        return this.baseResponse(true, describe, StatusConstant.OK, content);
    },

    /**
     * Error Response
     * @param {string} describe - Mô tả lỗi
     * @param {number} status_code - Mã trạng thái HTTP lỗi
     * @param {object|null} content - Thông tin chi tiết về lỗi
     * @returns {object} - Chuẩn response object
     */
    errorResponse(describe, status_code = StatusConstant.BAD_REQUEST, content = null) {
        return this.baseResponse(false, describe, status_code, content);
    },

    /**
     * List Response
     * @param {string} describe - Mô tả ngắn gọn về kết quả
     * @param {Array} items - Mảng dữ liệu
     * @param {number} total - Tổng số lượng items
     * @returns {object} - Chuẩn response object với định dạng list
     */
    listResponse(describe, items, total) {
        return this.successResponse(describe, {
            items,
            total
        });
    },

    /**
     * Page Response
     * @param {string} describe - Mô tả ngắn gọn về kết quả
     * @param {Array} items - Mảng dữ liệu
     * @param {number} total - Tổng số lượng items
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số items trên một trang
     * @param {number} totalPages - Tổng số trang
     * @returns {object} - Chuẩn response object với định dạng phân trang
     */
    pageResponse(describe, items, total, page, limit, totalPages) {
        return this.successResponse(describe, {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    },

    /**
     * Created Response - Sử dụng cho các resource mới được tạo
     * @param {string} describe - Mô tả ngắn gọn về resource đã tạo
     * @param {object} content - Dữ liệu resource
     * @returns {object} - Chuẩn response object
     */
    createdResponse(describe, content) {
        return this.baseResponse(true, describe, StatusConstant.CREATED, content);
    },

    /**
     * Not Found Response
     * @param {string} describe - Mô tả về resource không tìm thấy
     * @returns {object} - Chuẩn response object
     */
    notFoundResponse(describe = 'Resource không tìm thấy') {
        return this.errorResponse(describe, StatusConstant.NOT_FOUND);
    },

    /**
     * Unauthorized Response
     * @param {string} describe - Mô tả về lỗi xác thực
     * @returns {object} - Chuẩn response object
     */
    unauthorizedResponse(describe = 'Không được phép truy cập') {
        return this.errorResponse(describe, StatusConstant.UNAUTHORIZED);
    },

    /**
     * Tạo response cho lỗi không có quyền truy cập (403 Forbidden)
     * @param {string} message - Thông báo lỗi quyền truy cập
     * @returns {object} - Format response chuẩn
     */
    forbiddenResponse(message) {
        return this.errorResponse(message || 'Bạn không có quyền thực hiện hành động này', StatusConstant.FORBIDDEN)
    },

    /**
     * Bad Request Response
     * @param {string} describe - Mô tả về lỗi request
     * @param {object|null} validationErrors - Chi tiết lỗi validation nếu có
     * @returns {object} - Chuẩn response object
     */
    badRequestResponse(describe = 'Request không hợp lệ', validationErrors = null) {
        return this.errorResponse(describe, StatusConstant.BAD_REQUEST, validationErrors);
    },

    /**
     * Server Error Response
     * @param {string} describe - Mô tả về lỗi server
     * @param {object|null} errorDetails - Chi tiết lỗi (chỉ hiển thị trong môi trường development)
     * @returns {object} - Chuẩn response object
     */
    serverErrorResponse(describe = 'Lỗi server', errorDetails = null) {
        // Chỉ trả về chi tiết lỗi trong môi trường development
        const content = process.env.NODE_ENV === 'development' ? errorDetails : null;
        return this.errorResponse(describe, StatusConstant.INTERNAL_SERVER_ERROR, content);
    },
}

export default ResponseUtils;
