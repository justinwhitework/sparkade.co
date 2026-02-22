import React, { useState, useEffect } from "react";
import BaseBlock from "../ScopeBaseBlock";

const ImageBlock = ({ src, alt = "Image content", caption = "", children }) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");

    const img = new Image();
    img.onload = () => setStatus("idle");
    img.onerror = () => setStatus("error");
    img.src = src;
  }, [src]);

  return (
    <BaseBlock
      className="w-fit max-w-full h-auto min-h-16 shrink-0 overflow-visible mb-2"
      state={status}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto object-contain block"
      />
      {children}
    </BaseBlock>
  );
};

export default ImageBlock;