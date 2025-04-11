const S3Constant = {
    // AWS Region
    REGION: process.env.AWS_REGION || 'ap-southeast-1',

    // AWS credentials
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || (() => { throw new Error("No AWS_ACCESS_KEY_ID value in environment variable list!") })(),
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || (() => { throw new Error("No AWS_SECRET_ACCESS_KEY value in environment variable list!") })(),

    // Default bucket name
    DEFAULT_BUCKET: process.env.AWS_S3_BUCKET || (() => { throw new Error("No AWS_S3_BUCKET value in environment variable list!") })(),

    // Connection options
    MAX_ATTEMPTS: 3,
    REQUEST_TIMEOUT_MS: 30000,

    // Upload defaults
    DEFAULT_ACL: 'private', // 'private', 'public-read', 'public-read-write', 'authenticated-read'

    // URL expiration (in seconds)
    SIGNED_URL_EXPIRES: 3600, // 1 hour

    // File size limits (in bytes)
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB

    // Folder structure
    FOLDERS: {
        IMAGES: 'images/',
        DOCUMENTS: 'documents/',
        VIDEOS: 'videos/',
        TEMP: 'temp/',
        PUBLIC: 'public/'
    },

    DEFAULT_USER_AVATAR_URL: process.env.DEFAULT_USER_AVATAR_URL
};

export default S3Constant;
