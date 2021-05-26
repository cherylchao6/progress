require('dotenv').config()
const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PWD, DB_DB} = process.env;

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
}







// require('dotenv').config();

//node.js原生功能
// const { promisify } = require('util');

// const mysql = require('mysql2/promise');

// let db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PWD,
//     database: process.env.DB_DB,
//   });




//promisify db method
// let transaction = promisify(db.beginTransaction).bind(db);
// let query = promisify(db.query).bind(db);
// let commit = promisify(db.commit).bind(db);
// let rollback = promisify(db.rollback).bind(db);

// module.exports = {
//   pool
// };