import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import User from "../../src/models/User";

describe("User Integration Tests", () => {
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/user_test_db`;
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const user = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const res = await request(app).post("/api/users/register").send(user);

      expect(res.status).toBe(201);
      expect(res.text).toBe("User registered successfully");
    });
  });

  describe("POST /api/users/login", () => {
    it("should authenticate user and return token", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
      await user.save();

      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should handle authentication failure", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.text).toBe("Authentication failed");
    });
  });
});
