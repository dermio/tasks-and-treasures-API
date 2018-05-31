exports.DATABASE_URL = process.env.DATABASE_URL ||
                       "mongodb://localhost/taskTreasureDB";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                            "mongodb://localhost/test-taskTreasureDB";
exports.PORT = process.env.PORT || 8080;
