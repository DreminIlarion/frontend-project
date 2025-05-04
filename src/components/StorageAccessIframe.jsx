import React, { useEffect } from "react";

const StorageAccessIframe = () => {
  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "https://personal-account-c98o.onrender.com/set/token/storage-access";
    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, []);

  return null;
};

export default StorageAccessIframe;