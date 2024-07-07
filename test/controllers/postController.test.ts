import request from "supertest";
import sinon from "sinon";
import mongoose from "mongoose";
import app from "../../src/app"; // Ensure the correct path to app
import Post from "../../src/models/Post";
import Like from "../../src/models/Like"; // Add this import
import Comment from "../../src/models/Comment"; // Add this import
import logger from "../../src/utils/logger"; // Ensure logger is imported
import cache from "../../src/utils/cache"; // Ensure cache is imported

describe("Post Controller", () => {
  afterEach(() => {
    sinon.restore(); // Ensures that all sinon stubs/spies are restored after each test
  });

  describe("createPost", () => {
    it("should create a post for authenticated user", async () => {
      const saveStub = sinon.stub(Post.prototype, "save").resolves();
      const loggerStub = sinon.stub(logger, "info");

      const response = await request(app)
        .post("/api/posts/post-feed")
        .send({ content: "New post" });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe("New post");
      expect(saveStub.calledOnce).toBe(true);
      expect(loggerStub.calledWith(sinon.match("Post created by testUser"))).toBe(true);
    });

    it("should handle errors during post creation", async () => {
      const saveStub = sinon
        .stub(Post.prototype, "save")
        .rejects(new Error("Error creating post"));
      const loggerStub = sinon.stub(logger, "error");

      const response = await request(app)
        .post("/api/posts/post-feed")
        .send({ content: "New post" });

      expect(response.status).toBe(500);
      expect(saveStub.calledOnce).toBe(true);
      expect(loggerStub.calledWith(sinon.match("Error creating post"))).toBe(true);
    });
  });

  describe("getFeed", () => {
    afterEach(() => {
      sinon.restore(); // Ensures that all sinon stubs/spies are restored after each test
    });

    it("should retrieve the feed for authenticated user", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(),
        content: "Post content",
        toJSON: function() {
          return this;
        }
      };

      const postStub = sinon.stub(Post, "find").returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves([mockPost])
      } as any);
      const countDocumentsStub = sinon.stub(Post, "countDocuments").resolves(1);
      const likeFindStub = sinon.stub(Like, "find").resolves([]);
      const commentFindStub = sinon.stub(Comment, "find").resolves([]);
      const loggerStub = sinon.stub(logger, "info");
      const cacheStub = sinon.stub(cache, "get").returns(null);
      const cacheSetStub = sinon.stub(cache, "set");

      try {
        const response = await request(app)
          .get("/api/posts/feed")
          .query({ page: 1, limit: 10 });

        console.log('Response Status:', response.status);
        console.log('Response Body:', response.body);

        expect(response.status).toBe(200);
        expect(response.body.posts).toHaveLength(1);
        expect(postStub.calledOnce).toBe(true);
        expect(countDocumentsStub.calledOnce).toBe(true);
        expect(loggerStub.calledWith(sinon.match("Feed retrieved and cached successfully"))).toBe(true);
        expect(cacheSetStub.calledOnce).toBe(true);
      } catch (error) {
        console.error('Error during test execution:', error);
        throw error;
      }
    }, 5000); // Set a specific timeout for this test if it requires more time

    it("should handle errors during feed retrieval", async () => {
      const postStub = sinon.stub(Post, "find").throws(new Error("Error retrieving feed"));
      const countDocumentsStub = sinon.stub(Post, "countDocuments").throws(new Error("Error counting documents"));
      const likeFindStub = sinon.stub(Like, "find").throws(new Error("Error finding likes"));
      const commentFindStub = sinon.stub(Comment, "find").throws(new Error("Error finding comments"));
      const loggerStub = sinon.stub(logger, "error");
      const cacheStub = sinon.stub(cache, "get").returns(null);

      try {
        const response = await request(app)
          .get("/api/posts/feed")
          .query({ page: 1, limit: 10 });

        console.log('Error Response Status:', response.status);
        console.log('Error Response Body:', response.body);

        expect(response.status).toBe(500);
        expect(postStub.calledOnce).toBe(true);
        expect(countDocumentsStub.calledOnce).toBe(true);
        expect(likeFindStub.calledOnce).toBe(true);
        expect(commentFindStub.calledOnce).toBe(true);
        expect(loggerStub.calledWith(sinon.match("Error retrieving feed"))).toBe(true);
      } catch (error) {
        console.error('Error during test execution:', error);
        throw error;
      }
    }, 5000); // Adjusting the timeout for potentially slow operations
  });
});
