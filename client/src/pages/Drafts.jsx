import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../main";
import { toast } from "react-hot-toast";
import Loader from "./Loader";
import Post from "./Post";
import Offline from "./Offline";
import { useOnline } from "../utils/useOnline.js";

const Drafts = () => {
  const [posts, setposts] = useState([]);
  const { userdoc, isAuthentic } = useContext(Context);
  const [loading, setloading] = useState(false);
  const online = useOnline();

  const fetchData = async () => {
    if (!userdoc) {
      return;
    }
    const _id = userdoc._id;
    setloading(true);
    try {
      const { data } = await axios.post("/mydraft", { _id });
      setposts(data.posts);
      setloading(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthentic]);

  if (loading) {
    return <Loader />;
  }
  if (!online) {
    return <Offline />;
  }

  return (
    <div>
      {posts.length > 0 &&
        posts.map((post) => <Post {...post} key={post._id} />)}
    </div>
  );
};

export default Drafts;
