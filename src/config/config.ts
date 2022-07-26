const dotenv = require("dotenv");
dotenv.config();

const DB_USERNAME = process.env.DB_USERNAME || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "";
const DB_DATABASE = process.env.DB_DATABASE || "";

const PORT = process.env.PORT || 8000;

export const config = {
    mysql: {
        user: DB_USERNAME,
        password: DB_PASSWORD,
        host: DB_HOST,
        database: DB_DATABASE
    },
    server: {
        port: PORT,
    },
};
