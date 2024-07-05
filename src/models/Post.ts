import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  content: String,
  mediaUrl: String
});

const Post = mongoose.model('Post', postSchema);
export default Post;
