require("dotenv").config();
const { NODE_ENV } = process.env;
const crypto = require("crypto");
const {
  users
} = require("./fake_data");
const { pool } = require("../server/model/mysql");
// 要import fake_data.js 的假資料然後跟sql互動
async function _createFakeUser () {
  const encrypedUsers = users.map(user => {
    const encrypedUser = {
      name: user.name,
      email: user.email,
      password: user.password ? encryptPassword(user.password) : null
    };
    return encrypedUser;
  });
  return await pool.query("INSERT INTO users (name, email, password) VALUES ?", [encrypedUsers.map(x => Object.values(x))]);
}
async function createFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  // 以下為所有會執行的插入假資料流程
  await _createFakeUser();
}
async function truncateFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
  };
  // other tabel
  // "diary", "diary_data", "diary_images", "follow", "group_progress", "group_progress_diary", "group_progress_user", "last_read_msg", "message", "new_msg_status", "progress_data", "room", "room_user"
  const tables = ["users", "progress", "progress_data"];
  for (const table of tables) {
    await truncateTable(table);
  }
}

async function closeConnection () {
  return await pool.end();
}

async function main () {
  await truncateFakeData();
  await createFakeData();
  await closeConnection();
}

// execute when called directly.
if (require.main === module) {
  main();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection
};

function encryptPassword (password) {
  const hash = crypto.createHash("sha1");
  hash.update(password);
  return hash.digest("hex");
}
