import { useEffect, useState } from "react";

export const useOnline = () => {
  const [online, setonline] = useState(true);

  function getOnline() {
    setonline(true);
  }

  function getOffline() {
    setonline(false);
  }

  useEffect(() => {
    window.addEventListener("online", getOnline);

    window.addEventListener("offline", getOffline);

    return () => {
      window.removeEventListener("online", getOnline);
      window.removeEventListener("offline", getOffline);
    };
  }, []);

  return online;
};
