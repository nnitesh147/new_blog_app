import React from "react";

const Loader = () => {
  const arr = [1, 2, 3];
  return (
    <>
      {arr.map((index) => (
        <div key={index} className="shimmer"></div>
      ))}
    </>
  );
};

export default Loader;
