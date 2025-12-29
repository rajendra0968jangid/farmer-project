const dotenv = require("dotenv")
dotenv.config();

const dbConfig = {
    HOST:process.env.MYSQL_HOST,
    USER:process.env.MYSQL_USER,
    PASSWORD:process.env.MYSQL_PASSWORD,
    DB:process.env.MYSQL_DB,
    PORT:process.env.MYSQL_PORT
}
module.exports = dbConfig;