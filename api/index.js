import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import bcrypt from "bcrypt";
import sendCookie from "./features/utils.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import Posts from "./models/Post.js";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const App = express();

App.use(express.json());
App.use(cookieParser());

config({
  path: "./config.env",
});

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "BlogApp",
    })
    .then(() => {
      console.log("Database Connected");
    })
    .catch((error) => console.log(error));
}
App.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
async function deleteFromS3(cover) {
  const bucket = process.env.BUCKET_NAME;
  const client = new S3Client({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const parts = cover.split("com/");
  const newFilename = parts[parts.length - 1];
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: newFilename,
      })
    );
    return "Deleted";
  } catch (error) {
    console.log(error);
    return "error";
  }
}

async function uploadtoS3(path, originalFilename, mimetype) {
  const bucket = process.env.BUCKET_NAME;
  const client = new S3Client({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const parts = originalFilename.split(".");
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + "." + ext;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: "public-read",
      })
    );
  } catch (error) {
    console.log(error);
    return "error";
  }
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

App.get("/api/test", (req, res) => {
  connectDB();
  res.status(200).json({
    success: true,
    message: "Backend Working",
  });
});

App.post("/api/register", async (req, res) => {
  connectDB();
  const { name, email, password } = req.body;
  try {
    const userhai = await User.findOne({ email });
    if (userhai) {
      return res.status(400).json({
        success: false,
        message: "Already registered User",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(200).json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.post("/api/login", async (req, res) => {
  connectDB();
  const { email, password } = req.body;
  try {
    const userhai = await User.findOne({ email }).select("+password");
    if (!userhai) {
      return res.status(400).json({
        success: false,
        message: "Register First",
      });
    }

    const isMatch = await bcrypt.compare(password, userhai.password);
    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    sendCookie(userhai, res, `Welcome Back ${userhai.name}`, 200);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.get("/api/profile", async (req, res) => {
  connectDB();
  const { token } = req.cookies;
  if (!token) {
    return res.status(500).json({
      success: false,
      message: "Not Logged In",
    });
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
});

App.get("/api/logout", (req, res) => {
  connectDB();
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    })
    .json({
      success: true,
    });
});

const uploadMiddleWare = multer({ dest: "/tmp" });

App.post(
  "/api/createPost",
  uploadMiddleWare.single("file"),
  async (req, res) => {
    connectDB();
    const { token } = req.cookies;
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Login First",
      });
    }
    const { originalname, path, mimetype } = req.file;
    const url = await uploadtoS3(path, originalname, mimetype);
    if (url === "error") {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error in AWS",
      });
    }
    const { title, summary, content } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { name } = await User.findById(decoded._id);
      await Posts.create({
        title,
        summary,
        content,
        user: decoded._id,
        cover: url,
        username: name,
        draft: true,
      });
      return res.status(200).json({
        message: "Post Created Successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

App.get("/api/allPosts", async (req, res) => {
  connectDB();
  const { token } = req.cookies;
  if (!token) {
    const posts = await Posts.find({ draft: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json({
      success: true,
      posts,
    });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const posts = await Posts.find({ user: { $ne: decoded._id } })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json({
      success: true,
      posts,
    });
  }
});

App.post("/api/singlePost", async (req, res) => {
  connectDB();
  const { id1 } = req.body;
  if (!id1) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
  try {
    const post = await Posts.findById(id1);
    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.post("/api/mypost", async (req, res) => {
  connectDB();
  const { _id } = req.body;
  if (!_id) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error 1",
    });
  }
  try {
    const posts = await Posts.find({
      $and: [{ user: _id }, { draft: { $ne: false } }],
    });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error 2",
    });
  }
});

App.post("/api/mydraft", async (req, res) => {
  connectDB();
  const { _id } = req.body;
  if (!_id) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
  try {
    const posts = await Posts.find({
      $and: [{ user: _id }, { draft: { $ne: true } }],
    });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.put(
  "/api/updatepost",
  uploadMiddleWare.single("file"),
  async (req, res) => {
    connectDB();
    const { title, summary, content, userid, id1 } = req.body;
    const post = await Posts.findById(id1);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Invalid Post-Id",
      });
    }
    try {
      const user = await User.findById(userid);

      const isAuthor = JSON.stringify(post.user) === JSON.stringify(user._id);
      if (!isAuthor) {
        return res.status(404).json({
          success: false,
          message: "You are not the author of this post",
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "Error in Update Validation",
      });
    }
    const { cover } = post;
    let newPath = null;
    if (req.file) {
      if (cover) {
        const string = deleteFromS3(cover);
        if (string === "error") {
          return res.status(404).json({
            success: false,
            message: "Error in delete AWS",
          });
        }
      }
      const { originalname, path, mimetype } = req.file;
      newPath = await uploadtoS3(path, originalname, mimetype);
    }

    try {
      post.title = title;
      post.summary = summary;
      post.content = content;
      post.cover = newPath ? newPath : post.cover;

      post.draft = true;

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Updated Successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

App.post("/api/createdraft", async (req, res) => {
  connectDB();
  const { title, summary, content } = req.body;
  const { token } = req.cookies;
  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Login First",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await Posts.create({
      title,
      summary,
      content,
      user: decoded._id,
    });
    return res.status(200).json({
      _id: data._id,
      message: "Data Saved",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.post("/api/deletedraft", async (req, res) => {
  connectDB();
  const { id1 } = req.body;
  try {
    const data = await Posts.findById(id1);

    const { cover } = data;

    if (cover) {
      const string = deleteFromS3(cover);
      if (string === "error") {
        return res.status(404).json({
          success: false,
          message: "Error in delete AWS , Draft Not deleted",
        });
      }
    }

    await data.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Draft Deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.put("/api/updatedraft", async (req, res) => {
  connectDB();
  const { title, summary, content, id1 } = req.body;
  try {
    const post = await Posts.findById(id1);
    post.title = title;
    post.summary = summary;
    post.content = content;

    post.save();

    return res.status(200).json({
      success: true,
      message: "Draft Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.put("/api/edit/updatedraftvalue", async (req, res) => {
  connectDB();
  const { title, summary, content, id1 } = req.body;
  try {
    const post = await Posts.findById(id1);

    post.title = title;

    post.summary = summary;

    post.content = content;

    post.draft = false;

    post.save();

    return res.status(200).json({
      success: true,
      message: "Draft Updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.post("/api/deletePost", async (req, res) => {
  connectDB();
  const { id1 } = req.body;
  try {
    const post = await Posts.findById(id1);
    if (!post) {
      return res.status(500).json({
        success: false,
        message: "Invalid-Id",
      });
    }
    const { cover } = post;
    if (cover) {
      const string = deleteFromS3(cover);
      if (string === "error") {
        return res.status(404).json({
          success: false,
          message: "Error in delete AWS , Post Not deleted",
        });
      }
    }
    await post.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Post Deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

App.listen(3000, () => console.log("Server is Working"));
