exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       "mongodb://localhost/task-treasure-db";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                            "mongodb://localhost/test-task-treasure-db";
exports.PORT = process.env.PORT || 8080;

// Auth
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
