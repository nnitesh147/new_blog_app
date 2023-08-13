import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../main";
import { toast } from "react-hot-toast";
import Loader from "./Loader";
import Post from "./Post";

const Mypost = () => {
  const [posts, setposts] = useState([]);
  const { userdoc, isAuthentic } = useContext(Context);
  const [loading, setloading] = useState(false);

  const fetchData = async () => {
    if (!userdoc) {
      return;
    }
    const _id = userdoc._id;
    setloading(true);
    try {
      const { data } = await axios.post("/mypost", { _id });
      setposts(data.posts);
      setloading(false);
    } catch (error) {
      console.log(error);
      setloading(false);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthentic]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {posts.length > 0 &&
        posts.map((post) => <Post {...post} key={post._id} />)}
    </div>
  );
};

export default Mypost;
