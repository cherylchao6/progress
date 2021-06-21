require("dotenv").config();
const { assert, requester } = require("./set_up");
const { users } = require("./fake_data");

describe("user", function () {
  /**
   * Sign Up
   */

  it("sign up", async () => {
    const user = {
      name: "cheryl",
      email: "cheryl@gmail.com",
      password: "password"
    };

    const res = await requester
      .post("/signup")
      .send(user);

    const data = res.body;
    const userExpect = {
      access_token: data.data.access_token,
      user: {
        id: data.data.user.id,
        name: user.name,
        email: user.email
      }
    };
    assert.deepEqual(data.data, userExpect);
    assert.isString(data.data.access_token);
  });

  it("sign up without name or email or password", async () => {
    const user1 = {
      email: "cheryl@gmail.com",
      password: "password"
    };

    const res1 = await requester
      .post("/signup")
      .send(user1);

    assert.equal(res1.statusCode, 400);

    const user2 = {
      name: "cheryl",
      password: "password"
    };

    const res2 = await requester
      .post("/signup")
      .send(user2);

    assert.equal(res2.statusCode, 400);

    const user3 = {
      name: "cheryl",
      email: "cheryl@gmail.com"
    };

    const res3 = await requester
      .post("/signup")
      .send(user3);

    assert.equal(res3.statusCode, 400);
  });

  it("sign up with existed email", async () => {
    const user = {
      name: users[0].name,
      email: users[0].email,
      password: "password"
    };

    const res = await requester
      .post("/signup")
      .send(user);

    assert.equal(res.statusCode, 403);
  });

  it("sign up with malicious email", async () => {
    const user = {
      name: users[0].name,
      email: "<script>alert(1)</script>",
      password: "password"
    };

    const res = await requester
      .post("/signup")
      .send(user);

    assert.equal(res.body.error, "請輸入正確的email格式");
  });

  /**
   * Sign In
   */

  it("sign in with correct password", async () => {
    const user1 = users[0];
    const user = {
      email: user1.email,
      password: user1.password
    };

    const res = await requester
      .post("/signin")
      .send(user);

    const data = res.body.data;
    const userExpect = {
      access_token: data.access_token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: user.email
      }
    };

    assert.deepEqual(data, userExpect);
    assert.isString(data.access_token);
  });

  it("sign in without email or password", async () => {
    const user1 = users[0];
    const userNoEmail = {
      password: user1.password
    };
    const res1 = await requester
      .post("/signin")
      .send(userNoEmail);

    assert.equal(res1.status, 400);
    assert.equal(res1.body.error, "請輸入完整資訊");

    const userNoPassword = {
      email: user1.email
    };

    const res2 = await requester
      .post("/signin")
      .send(userNoPassword);

    assert.equal(res2.status, 400);
    assert.equal(res2.body.error, "請輸入完整資訊");
  });

  it("sign in with wrong password", async () => {
    const user1 = users[0];
    const user = {
      email: user1.email,
      password: "wrong password"
    };

    const res = await requester
      .post("/signin")
      .send(user);

    assert.equal(res.status, 403);
  });

  it("sign in with malicious password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: "\" OR 1=1; -- "
    };

    const res = await requester
      .post("/signin")
      .send(user);

    assert.equal(res.status, 403);
  });

  it("sign in with unregistered email", async () => {
    const user = {
      email: "unregistered@gmail.com",
      password: "password"
    };

    const res = await requester
      .post("/signin")
      .send(user);

    assert.equal(res.status, 401);
  });
});
