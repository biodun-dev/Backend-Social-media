import request from "supertest";
import sinon from "sinon";
import mongoose from "mongoose";
import app from "../../src/app";
import Post from "../../src/models/Post";
import Like from "../../src/models/Like";
import Comment from "../../src/models/Comment";
import logger from "../../src/utils/logger";
import cache from "../../src/utils/cache";

describe("Post Controller", () => {
  afterEach(() => {
    sinon.restore();
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
      expect(
        loggerStub.calledWith(sinon.match("Post created by testUser"))
      ).toBe(true);
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
      expect(loggerStub.calledWith(sinon.match("Error creating post"))).toBe(
        true
      );
    });
  });

  describe("getFeed", () => {
    it("should retrieve the feed for authenticated user", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(),
        content: "Post content",
        toJSON: function () {
          return this;
        },
      };

      const postStub = sinon.stub(Post, "find").returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves([mockPost]),
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

        console.log("Response Status:", response.status);
        console.log("Response Body:", response.body);

        expect(response.status).toBe(200);
        expect(response.body.posts).toHaveLength(1);
        expect(postStub.calledOnce).toBe(true);
        expect(countDocumentsStub.calledOnce).toBe(true);
        expect(likeFindStub.calledOnce).toBe(true);
        expect(commentFindStub.calledOnce).toBe(true);
        expect(
          loggerStub.calledWith(
            sinon.match("Feed retrieved and cached successfully")
          )
        ).toBe(true);
        expect(cacheSetStub.calledOnce).toBe(true);
      } catch (error) {
        console.error("Error during test execution:", error);
        throw error;
      }
    }, 5000);

    it("should handle errors during feed retrieval", async () => {
      const postStub = sinon
        .stub(Post, "find")
        .throws(new Error("Error retrieving feed"));
      const countDocumentsStub = sinon
        .stub(Post, "countDocuments")
        .throws(new Error("Error counting documents"));
      const likeFindStub = sinon
        .stub(Like, "find")
        .throws(new Error("Error finding likes"));
      const commentFindStub = sinon
        .stub(Comment, "find")
        .throws(new Error("Error finding comments"));
      const loggerStub = sinon.stub(logger, "error");
      const cacheStub = sinon.stub(cache, "get").returns(null);

      try {
        const response = await request(app)
          .get("/api/posts/feed")
          .query({ page: 1, limit: 10 });

        console.log("Error Response Status:", response.status);
        console.log("Error Response Body:", response.body);

        expect(response.status).toBe(500);
      } catch (error) {
        console.error("Error during test execution:", error);
        throw error;
      }
    }, 5000);
  });

  describe("likePost", () => {
    it("should like a post for authenticated user", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const postStub = sinon
        .stub(Post, "findById")
        .resolves({ _id: postId } as any);
      const likeStub = sinon.stub(Like.prototype, "save").resolves();
      const existingLikeStub = sinon.stub(Like, "findOne").resolves(null);
      const loggerStub = sinon.stub(logger, "info");

      const response = await request(app).post(`/api/posts/${postId}/like`);

      expect(response.status).toBe(201);
      expect(likeStub.calledOnce).toBe(true);
      expect(existingLikeStub.calledOnce).toBe(true);
      expect(postStub.calledOnce).toBe(true);
      expect(
        loggerStub.calledWith(
          sinon.match(`Like by testUser event emitted for post ${postId}`)
        )
      ).toBe(true);
    });

    it("should handle errors during liking a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const postStub = sinon
        .stub(Post, "findById")
        .throws(new Error("Error liking post"));
      const loggerStub = sinon.stub(logger, "error");

      const response = await request(app).post(`/api/posts/${postId}/like`);

      expect(response.status).toBe(500);
      expect(postStub.calledOnce).toBe(true);
      expect(loggerStub.calledWith(sinon.match("Error liking post"))).toBe(
        true
      );
    });
  });

  describe("commentOnPost", () => {
    it("should comment on a post for authenticated user", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const newComment = {
        postId,
        userId: "testUserId",
        comment: "Great post!",
      };
      const commentStub = sinon
        .stub(Comment.prototype, "save")
        .resolves(newComment as any);
      const loggerStub = sinon.stub(logger, "info");

      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .send({ comment: "Great post!" });

      expect(response.status).toBe(201);
      expect(response.body.comment).toBe("Great post!");
      expect(commentStub.calledOnce).toBe(true);
      expect(
        loggerStub.calledWith(
          sinon.match(`Comment event emitted for post ${postId}`)
        )
      ).toBe(true);
    });

    it("should handle errors during commenting on a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const commentStub = sinon
        .stub(Comment.prototype, "save")
        .throws(new Error("Error commenting on post"));
      const loggerStub = sinon.stub(logger, "error");

      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .send({ comment: "Great post!" });

      expect(response.status).toBe(500);
      expect(commentStub.calledOnce).toBe(true);
      expect(
        loggerStub.calledWith(sinon.match("Error commenting on post"))
      ).toBe(true);
    });
  });
});
