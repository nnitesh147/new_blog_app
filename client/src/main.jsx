import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export const Context = createContext({ isAuthentic: false });

const AppWrapper = () => {
  const [isAuthentic, setisAuthentic] = useState(false);
  const [userdoc, setuserdoc] = useState(null);
  const [delay, setdelay] = useState(false);

  return (
    <Context.Provider
      value={{
        isAuthentic,
        setisAuthentic,
        userdoc,
        setuserdoc,
        delay,
        setdelay,
      }}
    >
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<AppWrapper />);
