import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Context } from "../main";
import Offline from "./Offline";
import { useOnline } from "../utils/useOnline.js";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const [redirect, setredirect] = useState(false);
  const online = useOnline();

  const { setisAuthentic, setuserdoc, isAuthentic } = useContext(Context);

  const submitHandler = async (e) => {
    e.preventDefault();
    setloading(true);
    try {
      const { data } = await axios.post(
        "/login",
        {
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setuserdoc(data?.user);
      setisAuthentic(true);
      toast.success(data.message);
      setredirect(true);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setpassword("");
      setemail("");
      setuserdoc(null);
      setisAuthentic(false);
      setredirect(false);
    }
    setloading(false);
  };

  if (redirect || isAuthentic) {
    return <Navigate to={"/"} />;
  }
  if (!online) {
    return <Offline />;
  }

  return (
    <form className="login" onSubmit={submitHandler}>
      <h1>Login</h1>
      <input
        type="email"
        required
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setemail(e.target.value)}
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setpassword(e.target.value)}
      />
      <button disabled={loading} type="submit">
        Login
      </button>
    </form>
  );
};

export default Login;
