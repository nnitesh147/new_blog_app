import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { Context } from "../main";
import Offline from "./Offline";
import { useOnline } from "../utils/useOnline.js";

const Register = () => {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const [redirect, setredirect] = useState(false);

  const online = useOnline();

  const { isAuthentic } = useContext(Context);

  const passwordValidation = () => {
    if (password.length < 6 || password.includes(" ")) {
      toast.error(
        "Password length should be greater than 5 and should not contain any spaces"
      );
      setpassword("");
      return false;
    } else {
      return true;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!passwordValidation()) {
      return;
    }
    setloading(true);
    try {
      const { data } = await axios.post(
        "/register",
        {
          name,
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      setredirect(true);
    } catch (error) {
      toast.error(error.response.data.message);
      setredirect(false);
    }
    setloading(false);
  };

  if (isAuthentic) {
    return <Navigate to={"/"} />;
  }

  if (redirect) {
    return <Navigate to={"/login"} />;
  }
  if (!online) {
    return <Offline />;
  }
  return (
    <form className="register" onSubmit={submitHandler}>
      <h1>Register</h1>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setname(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setemail(e.target.value)}
        placeholder="E-Mail"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setpassword(e.target.value)}
        placeholder="Password"
      />
      <button disabled={loading} type="submit">
        Register
      </button>
    </form>
  );
};

export default Register;
