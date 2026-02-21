import React, { useState, useEffect } from "react";
import ScopeContainer from "./ScopeContainer.jsx";
import ScopeMarkdown from "./blocks/markdown.jsx";
import { BlockActions } from "./ScopeBaseBlock.jsx";
import { TbDownload } from "react-icons/tb";

const BLOCK_REGISTRY = {
  markdown: ScopeMarkdown,
};

const ScopeViewport = ({ document }) => {
  const [content, setContent] = useState(typeof document === 'object' ? document : null);
  const [status, setStatus] = useState(typeof document === 'string' ? "loading" : "idle");

  useEffect(() => {
    if (typeof document === 'object') {
      setContent(document);
      setStatus("idle");
      return;
    }

    if (typeof document === 'string') {
      setStatus("loading");
      fetch(document)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setContent(data);
          setStatus("idle");
        })
        .catch((err) => {
          console.error("[ScopeViewport] Failed to fetch document:", err);
          setStatus("error");
        });
    }
  }, [document]);

  const blocks = content?.documentContent || [];

  return (
    <div className="card rounded-none sm:rounded-3xl bg-base-100 p-2 sm:p-4 md:p-4 w-full h-full overflow-y-auto overflow-x-hidden items-center md:max-w-4xl mx-auto">
      <ScopeContainer
        state={status}
        className="w-full overflow-y-visible sm:p-2 gap-6 md:p-8 md:gap-12"
      >
        {status === "idle" && blocks.map((block, index) => {
          const Component = BLOCK_REGISTRY[block.type];

          if (!Component) {
            console.warn(`[ScopeEngine] Block type "${block.type}" not found.`);
            return null;
          }

          const hasActions = block.actions;

          return (
            <Component 
              key={block.id || index} 
              id={block.id} 
              {...block.props}
            >
              {hasActions && (
                <BlockActions>
                  <a 
                    href={block.actions.download}
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Download <TbDownload className="w-4 h-4" />
                  </a>
                </BlockActions>
              )}
            </Component>
          );
        })}
      </ScopeContainer>
    </div>
  );
};

export default ScopeViewport;