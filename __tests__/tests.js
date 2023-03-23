const request = require("supertest");

const app = require("../app");

const wait = (time) => new Promise((r) => setTimeout(r, time));

describe("Test the Http Server", () => {
  let agent;

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe("For public pages", () => {
    test("It should respond the GET method", async () => {
      const res = await agent.get("/");
      expect(res.statusCode).toBe(200);
    });

    test("It should respond 200 for existent pages", async () => {
      const res = await agent.get("/public.html");
      expect(res.statusCode).toBe(200);
    });

    test("It should respond 404 for non existent pages", async () => {
      const res = await agent.get("/not-existent.html");
      expect(res.statusCode).toBe(404);
    });

    test("It should respond 404 for inaccessible pages", async () => {
      const res = await agent.get("/../not-accesible.html");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("For private pages", () => {
    test("It should respond 200 if credential is provided", async () => {
      const res = await agent.get("/private.html?password=123456");
      expect(res.statusCode).toBe(200);
    });

    test("It should respond 200 if authenticated before", async () => {
      await agent.get("/private.html?password=123456");
      const res = await agent.get("/private.html");
      expect(res.statusCode).toBe(200);
    });

    test("It should respond 403 after cookie expired", async () => {
      await agent.get("/private.html?password=123456&maxAge=1000");
      await wait(1100);
      const res = await agent.get("/private.html");
      expect(res.statusCode).toBe(403);
    });

    test("It should respond 403 if no credential is provided", async () => {
      const res = await agent.get("/private.html");
      expect(res.statusCode).toBe(403);
    });
  });
});
