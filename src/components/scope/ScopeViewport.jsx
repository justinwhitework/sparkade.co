import React, { useState, useEffect } from "react";
import ScopeContainer from "./ScopeContainer.jsx";
import BlockMarkdown from "./blocks/markdown.jsx";
import BlockProfile from "./blocks/profile.jsx";
import BlockBanner from "./blocks/banner.jsx";
import { BlockActions } from "./ScopeBaseBlock.jsx";
import { TbDownload } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "../ui/dropdown-menu.js";

const BLOCK_REGISTRY = {
  markdown: BlockMarkdown,
  profile : BlockProfile,
  banner : BlockBanner,
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
    <div className="card bg-base-100 p-8 md:rounded-2xl rounded-none sm:p-4 md:p-4 w-full h-full overflow-y-auto overflow-x-hidden items-center md:max-w-4xl lg:max-w-5xl mx-auto">
      <ScopeContainer
        state={status}
        className="w-full overflow-y-visible sm:p-2 md:p-8"
      >
        {status === "idle" && blocks.map((block, index) => {
          const Component = BLOCK_REGISTRY[block.type];

          if (!Component) {
            console.warn(`[ScopeEngine] Block type "${block.type}" not found.`);
            return null;
          }

          if (block.visible == false) {
            return null;
          }

          const hasDownloadActions = block.actions && block.actions.download;

          return (
            <Component 
              key={block.id || index} 
              id={block.id} 
              {...block.props}
            >
              {hasDownloadActions && (
                <BlockActions>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                   <DropdownMenuItem>
                     <a 
                    href={block.actions.download}
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Download <TbDownload className="w-4 h-4" />
                  </a>
                   </DropdownMenuItem>
                  </DropdownMenuGroup>
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