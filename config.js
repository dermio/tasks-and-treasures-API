exports.DATABASE_URL = process.env.DATABASE_URL ||
                       "mongodb://localhost/task-treasure-db";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                            "mongodb://localhost/test-task-treasure-db";
exports.PORT = process.env.PORT || 8080;
