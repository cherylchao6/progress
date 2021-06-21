const { assert, requester } = require("./set_up");
const { users } = require("./fake_data");
describe("verifyreqQuery", function () {
  /**
   * add progress
   */
  it("get api data with number query parameter", async () => {
    // sign in before get api
    const user = users[0];
    const res1 = await requester
      .post("/signin")
      .send(user);
    const accessToken = res1.body.data.access_token;
    const userId = res1.body.data.user.id;
    const res2 = await requester
      .get(`/api/1.0/user?userid=${userId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(res2.statusCode, 200);
  });

  it("get api data with malicious query parameter", async () => {
    // sign in before get api
    const user = users[0];
    const res1 = await requester
      .post("/signin")
      .send(user);
    const accessToken = res1.body.data.access_token;
    const userId = "<script>alert(1)</script>";
    const res2 = await requester
      .get(`/api/1.0/user?userid=${userId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(res2.statusCode, 401);
  });
});
