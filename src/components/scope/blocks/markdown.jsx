import React, { useState, useEffect, useRef } from "react";
import BaseBlock from "../ScopeBaseBlock";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../../styles/markdown.css";

const MarkdownRenderer = ({ sourceLocation, children }) => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [status, setStatus] = useState("loading");
  const [hasIntersected, setHasIntersected] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasIntersected || !sourceLocation) {
      if (!sourceLocation) setStatus("failure");
      return;
    }

    setStatus("loading");

    fetch(sourceLocation)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((data) => {
        setMarkdownContent(data);
        setStatus("idle");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, [sourceLocation, hasIntersected]);

  return (
    <div ref={containerRef} className="my-4 mb-8">
      <BaseBlock className="min-h-8" state={status}>
        <div className="md-content">
          <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
        </div>
        {children}
      </BaseBlock>
    </div>
  );
};

export default MarkdownRenderer;