import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    summary: String,
    content: String,
    cover: String,
    draft: {
      type: Boolean,
      default: false,
    },
    username: String,
    createdAt: { type: Date, default: Date.now() },
  },
  { timestamp: true }
);

const Posts = mongoose.model("posts", postSchema);

export default Posts;
