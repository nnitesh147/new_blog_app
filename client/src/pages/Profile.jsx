import React, { useState } from "react";
import Mypost from "./Mypost";
import Drafts from "./Drafts";
import Offline from "./Offline";
import { useOnline } from "../utils/useOnline.js";

const Profile = () => {
  const [post, setpost] = useState(true);
  const [drafts, setdrafts] = useState(false);
  const online = useOnline();
  if (!online) {
    return <Offline />;
  }
  return (
    <>
      <div className="profile">
        <button
          className="btn"
          onClick={() => {
            setpost(true);
            setdrafts(false);
          }}
        >
          My Post
        </button>
        <button
          className="btn"
          onClick={() => {
            setpost(false);
            setdrafts(true);
          }}
        >
          Drafts
        </button>
      </div>
      {post && (
        <div className="singlepost">
          <Mypost />
        </div>
      )}
      {drafts && (
        <>
          <Drafts />
        </>
      )}
    </>
  );
};

export default Profile;
