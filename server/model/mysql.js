require("dotenv").config();
const mysql = require("mysql2/promise");
const { DB_HOST, DB_USER, DB_PWD, DB_DB } = process.env;

const mysqlConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PWD,
  database: DB_DB,
  waitForConnections: true,
  connectionLimit: 20
};

const pool = mysql.createPool(mysqlConfig);
module.exports = {
  pool
};
