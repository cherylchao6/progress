require("dotenv").config();
const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { truncateFakeData, createFakeData } = require("./fake_data_generator");
const { NODE_ENV } = process.env;

chai.use(chaiHttp);

const assert = chai.assert;
const requester = chai.request(app).keepOpen();

before(async function () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  assert,
  requester
};
