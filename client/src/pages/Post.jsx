import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Post = ({ title, summary, cover, username, createdAt, _id }) => {
  return (
    <Link
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      to={`/post/${_id}`}
    >
      <div>
        <div className="post">
          <div className="image">
            <img src={cover} />
          </div>
          <div className="texts">
            <h2>{title}</h2>
            <p className="info">
              <a className="author">{username}</a>
              <time>{format(new Date(createdAt), "MMM d yyyy , HH:mm")}</time>
            </p>
            <p className="summary">{summary}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Post;
