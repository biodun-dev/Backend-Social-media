import request from "supertest";
import app from "../../src/app"; // Adjust the path if necessary
import User from "../../src/models/User";

jest.mock("../../src/models/User");

describe("User Controller", () => {
  let mockSave: jest.Mock;
  let mockFindOne: jest.Mock;

  beforeAll(() => {
    mockSave = jest.fn();
    mockFindOne = jest.fn();
    User.prototype.save = mockSave;
    User.findOne = mockFindOne;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const user = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };
      mockSave.mockResolvedValue(user);

      const res = await request(app).post("/api/users/register").send(user);

      expect(res.status).toBe(201);
      expect(res.text).toBe("User registered successfully");
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it("should handle errors", async () => {
      mockSave.mockRejectedValue(new Error("Save failed"));

      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(500);
    });
  });

  describe("login", () => {
    it("should authenticate user and return token", async () => {
      const user = {
        email: "test@example.com",
        password: "password123",
        comparePassword: jest.fn().mockResolvedValue(true),
        _id: "userId",
      };
      mockFindOne.mockResolvedValue(user);

      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });

    it("should handle authentication failure", async () => {
      mockFindOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.text).toBe("Authentication failed");
    });
  });
});
