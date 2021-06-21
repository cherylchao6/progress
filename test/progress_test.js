require("dotenv").config();
const { assert, requester } = require("./set_up");
const { users } = require("./fake_data");
const fs = require("fs");

describe("addProgress", function () {
  /**
   * add progress
   */
  it("add progress without upload a progress picture", async () => {
    // sign in before add progress
    const user = users[0];
    const res1 = await requester
      .post("/signin")
      .send(user);
    const accessToken = res1.body.data.access_token;
    // add progress with all required fields
    const res2 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1");
    assert.equal(res2.statusCode, 200);
    // add progress without progressName
    const res3 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1");
    assert.equal(res3.status, 400);
    assert.equal(res3.body.error, "Progress名字和動機為必填欄位");
    // add progress without motivation
    const res4 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1");
    assert.equal(res4.status, 400);
    assert.equal(res4.body.error, "Progress名字和動機為必填欄位");
    // add progress with non-existent category
    const res5 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("motivation", "motivation")
      .field("category", "不存在的類別")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1");
    assert.equal(res5.status, 400);
    assert.equal(res5.body.error, "沒有這種類別");
    // add progress with non-existent checkPrivacy Value
    const res6 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "沒有這個值");
    assert.equal(res6.status, 400);
    assert.equal(res6.body.error, "不正常");
    // add progress with long progress name
    const res7 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "tooLongProgressName")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1");
    assert.equal(res7.status, 400);
    assert.equal(res7.body.error, "輸入過長字元");
  });

  it("add progress with uploading a progress picture", async () => {
    // sign in before add progress
    const user = users[0];
    const res1 = await requester
      .post("/signin")
      .send(user);
    const accessToken = res1.body.data.access_token;
    // add progress with normal-size picture
    const res2 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1")
      .attach("picture", "/Users/cherylchao/Documents/progress/public/images/logo.jpg");
    assert.equal(res2.statusCode, 200);
    // add progress with large-size picture
    const res3 = await requester
      .post("/addProgress")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("Content-Type", "multipart/form-data")
      .field("progressName", "name")
      .field("motivation", "motivation")
      .field("category", "運動")
      .field("addNum", "on")
      .field("input1Name", "體重")
      .field("input1Unit", "kg")
      .field("input2Name", "")
      .field("input2Unit", "")
      .field("input3Name", "")
      .field("input3Unit", "")
      .field("checkPrivacy", "1")
      .attach("picture", "/Users/cherylchao/Documents/progress/public/images/big_pic_for_test.png");
    assert.equal(res3.statusCode, 500);
    assert.equal(res3.body.error.message, "File too large");
  });
});
