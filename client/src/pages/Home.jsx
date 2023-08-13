import React, { useContext, useEffect, useState } from "react";
import Post from "./Post";
import axios from "axios";
import { Context } from "../main";
import Loader from "./Loader";
import { useOnline } from "../utils/useOnline";
import Offline from "./Offline";
const Home = () => {
  const [posts, setposts] = useState([]);
  const { isAuthentic } = useContext(Context);
  const online = useOnline();
  const datafetch = async () => {
    try {
      const { data } = await axios.get("/allPosts");
      setposts(data.posts);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    datafetch();
  }, [isAuthentic]);

  if (posts.length == 0) {
    return <Loader />;
  }

  if (!online) {
    return <Offline />;
  }

  return (
    <>
      {posts.length > 0 &&
        posts.map((post) => <Post {...post} key={post._id} />)}
    </>
  );
};

export default Home;
