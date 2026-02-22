import ScopeContainer from "./ScopeContainer.jsx";
import React, { createContext, useContext, useState, useEffect } from "react";
import { LuGripVertical } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "../ui/dropdown-menu.js";

const BlockActionsContext = createContext(null);

const BaseBlock = ({ children, className, state }) => {
  const [actions, setActions] = useState([]);

  const containerClass = `${className} w-full flex flex-row bg-transparent gap-4 h-auto`;

  return (
    <BlockActionsContext.Provider value={setActions}>
      <ScopeContainer
        state={state||"failure"}
        className={containerClass}
      >
        <div className="w-6 sm:w-12 md:w-24 p-2 sm:pr-4 md:pr-12 flex flex-col items-end gap-2 shrink-0 ">
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 bg-transparent">
                  <LuGripVertical className="hover:text-base-content text-base-300 transition-all delay-100" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="flex flex-col bg-base-100 border-base-300 text-base-content">
               {actions
                    .flat()
                    .filter(Boolean)
                    .map((action, i) => (
                      <>
                        {action}
                      </>
                    ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 h-auto">{children}</div>
        <div className="w-6 sm:w-12 md:w-24 shrink-0"></div>
      </ScopeContainer>
    </BlockActionsContext.Provider>
  );
};

// Accept multiple actions and register as array
const BlockActions = ({ children }) => {
  const register = useContext(BlockActionsContext);

  useEffect(() => {
    if (!register) return;

    // Wrap children in an array if not already
    const items = Array.isArray(children) ? children : [children];

    register((prev) => [...prev, items]);
  }, [register, children]);

  return null;
};

export { BaseBlock, BlockActions };
export default BaseBlock;
