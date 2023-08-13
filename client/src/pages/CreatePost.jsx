import axios from "axios";
import React, { useContext } from "react";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import { Context } from "../main";
import { toast } from "react-hot-toast";
import Editor from "./Editor";
import { useEffect } from "react";

const CreatePost = () => {
  const [title, settitle] = useState("");
  const [summary, setsummary] = useState("");
  const [content, setcontent] = useState("");
  const [files, setfiles] = useState("");
  const [redirect, setredirect] = useState(false);
  const [id1, setid1] = useState(null);
  const [loading, setloading] = useState(false);

  const submitHandler = async (e) => {
    setloading(true);
    deletedraft();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files[0]);
    e.preventDefault();
    try {
      const details = await axios.post("/createPost", data);
      toast.success(details.data.message);
      setredirect(true);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setredirect(false);
    }
    setloading(false);
  };

  const CreateDraft = async () => {
    try {
      const { data } = await axios.post("/createdraft", {
        title,
        summary,
        content,
      });
      setid1(data._id);
      toast.success(data.message);
    } catch (error) {
      console.log(error);
      setid1(null);
      toast.error(error?.response?.data?.message);
    }
  };

  const deletedraft = async () => {
    if (!id1) {
      return;
    }

    try {
      const { data } = await axios.post("/deletedraft", { id1 });
      setid1(null);
      toast.success(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  const updatedraft = async () => {
    try {
      const { data } = await axios.put("/updatedraft", {
        title,
        summary,
        content,
        id1,
      });
      toast.success(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (title.length < 1 && summary.length < 1 && content.length < 1) {
      deletedraft();
      return;
    }
    const timeId = setTimeout(() => {
      if (!id1) {
        CreateDraft();
        return;
      } else {
        updatedraft();
      }
    }, 4000);
    return () => {
      clearTimeout(timeId);
    };
  }, [title, summary, content]);

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form onSubmit={submitHandler}>
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(e) => settitle(e.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(e) => setsummary(e.target.value)}
      />
      <input type="file" required onChange={(e) => setfiles(e.target.files)} />
      <Editor value={content} onChange={setcontent} />
      <button type="submit" disabled={loading} style={{ marginTop: "5px" }}>
        Create Post
      </button>
    </form>
  );
};

export default CreatePost;
