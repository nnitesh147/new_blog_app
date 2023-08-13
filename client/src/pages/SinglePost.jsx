import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Context } from "../main";
import { toast } from "react-hot-toast";
import Loader from "./Loader";
import Offline from "./Offline";
import { useOnline } from "../utils/useOnline";

const SinglePost = () => {
  const { id } = useParams();
  const id1 = id;
  const [postdoc, setpostdoc] = useState(null);
  const { userdoc, isAuthentic } = useContext(Context);
  const [redirect, setredirect] = useState(false);
  const online = useOnline();

  const deleteHandler = async () => {
    try {
      const { data } = await axios.post("/deletePost", { id1 });
      toast.success(data.message);
      setredirect(true);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    axios
      .post("/singlePost", { id1 })
      .then((response) => {
        setpostdoc(response.data.post);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error?.response?.data?.message);
      });
  }, [isAuthentic]);

  if (!postdoc) {
    return <Loader />;
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }
  if (!online) {
    return <Offline />;
  }

  return (
    <div className="postpage">
      <h1>{postdoc.title}</h1>
      <time>{postdoc.createdAt}</time>
      <div className="author">by @{postdoc.username}</div>
      {postdoc.user === userdoc?._id && (
        <div className="edit-row">
          <Link to={`/edit/${postdoc._id}`} className="edit-btn">
            Edit this post
          </Link>
          <button onClick={deleteHandler}>Delete Post</button>
        </div>
      )}
      <div className="image">
        <img src={postdoc?.cover} />
      </div>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postdoc.content }}
      />
    </div>
  );
};

export default SinglePost;
