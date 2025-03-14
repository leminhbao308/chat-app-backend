/**
 * Status Code Constants
 * Định nghĩa các mã trạng thái HTTP cho API
 */
const StatusConstant = {
    // 2xx Success
    OK: 200,                    // Request thành công
    CREATED: 201,               // Resource đã được tạo thành công
    ACCEPTED: 202,              // Request đã được chấp nhận để xử lý
    NO_CONTENT: 204,            // Request thành công nhưng không có content trả về

    // 3xx Redirection
    MOVED_PERMANENTLY: 301,     // Resource đã được chuyển vĩnh viễn
    FOUND: 302,                 // Resource tạm thời được tìm thấy ở URL khác
    SEE_OTHER: 303,             // Response ở URL khác
    NOT_MODIFIED: 304,          // Resource không thay đổi từ lần request trước

    // 4xx Client Error
    BAD_REQUEST: 400,           // Request không hợp lệ hoặc có lỗi cú pháp
    UNAUTHORIZED: 401,          // Yêu cầu xác thực
    FORBIDDEN: 403,             // Không có quyền truy cập resource
    NOT_FOUND: 404,             // Resource không tìm thấy
    METHOD_NOT_ALLOWED: 405,    // HTTP method không được phép với resource
    NOT_ACCEPTABLE: 406,        // Server không thể đáp ứng Accept header
    CONFLICT: 409,              // Conflict với trạng thái hiện tại của resource
    GONE: 410,                  // Resource không còn tồn tại vĩnh viễn
    UNSUPPORTED_MEDIA_TYPE: 415, // Media type không được hỗ trợ
    UNPROCESSABLE_ENTITY: 422,  // Dữ liệu hợp lệ nhưng không thể xử lý
    TOO_MANY_REQUESTS: 429,     // Quá nhiều request

    // 5xx Server Error
    INTERNAL_SERVER_ERROR: 500, // Lỗi server không xác định
    NOT_IMPLEMENTED: 501,       // Server không hỗ trợ chức năng được yêu cầu
    BAD_GATEWAY: 502,           // Gateway nhận response không hợp lệ từ upstream
    SERVICE_UNAVAILABLE: 503,   // Server tạm thời không khả dụng
    GATEWAY_TIMEOUT: 504,       // Gateway không nhận được response từ upstream

    // Custom Status
    VALIDATION_ERROR: 422,      // Lỗi validation (giống UNPROCESSABLE_ENTITY)
    RATE_LIMIT_EXCEEDED: 429,   // Rate limit bị vượt quá (giống TOO_MANY_REQUESTS)
    MAINTENANCE_MODE: 503       // Server đang bảo trì (giống SERVICE_UNAVAILABLE)
};

export default StatusConstant;
