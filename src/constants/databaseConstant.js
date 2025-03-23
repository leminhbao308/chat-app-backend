import 'dotenv/config'

/**
 * Các hằng số liên quan đến database
 */
const DatabaseConstant = {
    // Connection string
    MONGO_URI: process.env.MONGO_URI || (() => { throw new Error("No MONGO_URI value in environment variable list!") })(),
    MONGO_USERNAME: process.env.MONGO_USERNAME || (() => { throw new Error("No MONGO_USERNAME value in environment variable list!") })(),
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || (() => { throw new Error("No MONGO_PASSWORD value in environment variable list!") })(),

    // Database name
    DATABASE_NAME: process.env.DB_NAME || 'chat_app_database',

    // Collections
    COLLECTIONS: {
        USERS: 'users',
        REFRESH_TOKENS: 'refresh_tokens',
        VERIFICATION_TOKENS: 'verification_tokens',
        PASSWORD_RESET_TOKENS: 'password_reset_tokens'
    },

    // Index names
    INDEXES: {
        USER_EMAIL: 'user_email_idx',
        USER_PHONE: 'user_phone_idx',
        USER_SEARCH: 'user_search_idx'
    }
};

export default DatabaseConstant;
