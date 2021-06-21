require("dotenv").config();
const mysql = require("mysql2/promise");
require("dotenv").config();

const env = process.env.NODE_ENV || "test";
const { DB_HOST, DB_USER, DB_PWD, DB_DB, DB_DB_TEST } = process.env;

const mysqlConfig = {
  production: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB
  },
  test: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_DB_TEST
  }
};

const mysqlEnv = mysqlConfig[env];
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;

const pool = mysql.createPool(mysqlEnv);

module.exports = {
  pool
};
