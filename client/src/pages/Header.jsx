import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useOnline } from "../utils/useOnline";

const Header = () => {
  const { isAuthentic, setisAuthentic, setuserdoc, userdoc } =
    useContext(Context);

  const logOutHandler = async () => {
    try {
      await axios.get("/logout");
      toast.success("LogOut SuccessFull");
      setisAuthentic(false);
      setuserdoc(null);
      setdelay(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <header>
      <Link to={"/"} className="logo">
        Blog Hub
      </Link>
      <nav>
        {isAuthentic ? (
          <>
            <Link to={"/profile"}>{userdoc.name} Your Profile</Link>
            <Link to={"/createPost"}>Create New Post</Link>
            <Link to={"/"} onClick={logOutHandler}>
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link to={"/login"}>Login</Link>
            <Link to={"/register"}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
