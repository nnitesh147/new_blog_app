import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Editor from "./Editor";
import Loader from "./Loader";

const EditPost = () => {
  const { id } = useParams();
  const [title, settitle] = useState("");
  const [summary, setsummary] = useState("");
  const [content, setcontent] = useState("");

  const [files, setfiles] = useState("");
  const [redirect, setredirect] = useState(false);
  const [userid, setuserid] = useState("");
  const [id1, setid1] = useState(id);
  const [del, setdel] = useState(false);
  const [loading, setloading] = useState(false);

  const updateHandler = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("id1", id1);
    data.set("userid", userid);

    if (files?.[0]) {
      data.set("file", files[0]);
    }

    try {
      const details = await axios.put("/updatepost", data);
      toast.success(details.data.message);
      setredirect(true);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setredirect(false);
    }
  };

  useEffect(() => {
    setloading(true);
    axios
      .post("/singlePost", { id1 })
      .then((response) => {
        setcontent(response.data.post.content);
        settitle(response.data.post.title);
        setsummary(response.data.post.summary);
        setuserid(response.data.post.user);
        setloading(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error?.response?.data?.message);
        setloading(false);
      });
  }, []);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const deletedraft = async () => {
    if (!id1) {
      return;
    }
    try {
      const { data } = await axios.post("/deletedraft", { id1 });
      toast.success(data.message);
      setid1(null);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  const updatedraft = async () => {
    try {
      const { data } = await axios.put("/edit/updatedraftvalue", {
        title,
        summary,
        content,
        id1,
      });
      toast.success(data.message);
      setdel(true);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  const createDraft = async () => {
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

  useEffect(() => {
    if (del && title.length < 1 && summary.length < 1 && content.length < 1) {
      deletedraft();
      return;
    }
    const timeId = setTimeout(() => {
      if (!id1) {
        createDraft();
        return;
      } else {
        updatedraft();
      }
    }, 4000);
    return () => {
      clearTimeout(timeId);
    };
  }, [title, summary, content]);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  if (loading) {
    return <Loader />;
  }
  return (
    <form onSubmit={updateHandler}>
      <input
        type="title"
        placeholder={"Title"}
        required
        value={title}
        onChange={(e) => settitle(e.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(e) => setsummary(e.target.value)}
      />
      <input type="file" onChange={(e) => setfiles(e.target.files)} />
      <Editor value={content} onChange={setcontent} />
      <button type="submit" disabled={loading} style={{ marginTop: "5px" }}>
        Update Post
      </button>
    </form>
  );
};

export default EditPost;
