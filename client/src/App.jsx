import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import Header from "./pages/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { Context } from "./main";
import CreatePost from "./pages/CreatePost";
import SinglePost from "./pages/SinglePost";
import Profile from "./pages/Profile";
import Mypost from "./pages/Mypost";

import EditPost from "./pages/EditPost";
const App = () => {
  const { setisAuthentic, setuserdoc } = useContext(Context);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    setloading(true);
    axios
      .get("/profile")
      .then((res) => {
        setisAuthentic(true);
        setuserdoc(res.data.user);
        setloading(false);
      })
      .catch((error) => {
        setisAuthentic(false);
        setuserdoc(null);
        setloading(false);
        toast.error(error?.response?.data?.message);
      });
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my/posts" element={<Mypost />} />
        <Route path="/createPost" element={<CreatePost />} />
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
