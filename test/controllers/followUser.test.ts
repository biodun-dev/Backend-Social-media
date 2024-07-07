import request from "supertest";
import sinon from "sinon";
import mongoose from "mongoose";
import app from "../../src/app";
import User from "../../src/models/User";
import logger from "../../src/utils/logger";

describe("User Controller - followUser", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("followUser", () => {
    it("should follow a user for authenticated user", async () => {
      const userId = new mongoose.Types.ObjectId().toString(); // Simulate user ID
      const followId = new mongoose.Types.ObjectId().toString();
      const user = {
        _id: userId,
        following: [],
        save: sinon.stub().resolves(),
      };

      const findByIdStub = sinon.stub(User, "findById").resolves(user as any);
      const loggerStub = sinon.stub(logger, "info");

      const response = await request(app)
        .post(`/api/users/follow/${followId}`)
        .set("Authorization", `Bearer fakeToken`) // Ensure the middleware runs
        .expect(200);

      expect(response.text).toBe("User followed");
      expect(user.save.calledOnce).toBe(true);
      expect(user.following).toContain(followId);
      expect(
        loggerStub.calledWith(
          sinon.match(`User followed successfully: ${followId}`)
        )
      ).toBe(true);
    });

    it("should handle errors during following a user", async () => {
      const userId = new mongoose.Types.ObjectId().toString(); // Simulate user ID
      const followId = new mongoose.Types.ObjectId().toString();
      const findByIdStub = sinon
        .stub(User, "findById")
        .throws(new Error("Error following user"));
      const loggerStub = sinon.stub(logger, "error");

      const response = await request(app)
        .post(`/api/users/follow/${followId}`)
        .set("Authorization", `Bearer fakeToken`) // Ensure the middleware runs
        .expect(500);
    });
  });
});
