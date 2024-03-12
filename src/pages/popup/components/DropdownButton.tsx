import { forwardRef, useEffect, useRef, useState } from "react";
import { Menu } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import DropdownItem from "@pages/popup/components/DropdownItem";
import Folder from "@assets/icons/Folder";
import Caret from "@assets/icons/Caret";

const FolderBookmark = forwardRef<
  HTMLDivElement,
  {
    node: chrome.bookmarks.BookmarkTreeNode;
    onHover: () => void;
    onHoverOut: () => void;
    openedBookmark: string | null;
    setOpenedBookmark: (id: string) => void;
    open: boolean;
    close: () => void;
    openMenu: () => void;
    active: boolean;
  }
>(({ node, openedBookmark, setOpenedBookmark, onHover, onHoverOut, open, close, openMenu, active }, ref) => {
  useEffect(() => {
    if (!open && openedBookmark === node.id) {
      setOpenedBookmark(null);
    } else if (open && openedBookmark !== node.id) {
      setOpenedBookmark(node.id);
    }
  }, [open]);
  useEffect(() => {
    if (!open && openedBookmark === node.id) {
      openMenu();
    } else if (open && openedBookmark !== node.id) {
      close();
    }
  }, [openedBookmark]);

  const dropdownFolderWrapperClass = (active: boolean) =>
    `cursor-pointer flex flex-row items-center justify-between gap-1.5 px-5 py-1 ${
      active ? "bg-chrome-dropdown-hover-light dark:bg-chrome-dropdown-hover-dark" : ""
    }`;
  const dropdownFolderTextWrapperClass = `flex flex-row items-center gap-1.5 text-[13px]`;
  const dropdownTextClass = (active: boolean) =>
    `text-[13px] overflow-hidden whitespace-nowrap text-ellipsis ${
      active
        ? "text-chrome-dropdown-text-hover-light dark:text-chrome-dropdown-text-hover-dark"
        : "text-chrome-dropdown-text-light dark:text-chrome-dropdown-text-dark"
    }`;
  return (
    <div
      className={dropdownFolderWrapperClass(active)}
      onMouseEnter={onHover}
      onMouseLeave={onHoverOut}
      onClick={(event) => {
        if (open) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      ref={ref}
    >
      <div className={dropdownFolderTextWrapperClass}>
        <div className="w-[18px] h-[18px]">
          <Folder />
        </div>
        <div className={dropdownTextClass(active)}>{node.title}</div>
      </div>
      <div className="w-[10px] h-[10px]">
        <Caret />
      </div>
    </div>
  );
});

const DropdownButton = ({
  node,
  active,
  openedBookmark,
  setOpenedBookmark,
  hoveredBookmark,
  setHoveredBookmark,
}: {
  node: chrome.bookmarks.BookmarkTreeNode;
  active: boolean;
  openedBookmark: string | null;
  setOpenedBookmark: (id: string) => void;
  hoveredBookmark: string | null;
  setHoveredBookmark: (id: string) => void;
}) => {
  const buttonRef = useRef(null);
  const openMenu = () => buttonRef?.current?.click();
  const [openedSubBookmark, setOpenedSubBookmark] = useState<string | undefined>(null);
  const [hoveredSubBookmark, setHoveredSubBookmark] = useState<string | undefined>(null);
  const [activeFolder, setActiveFolder] = useState<string | undefined>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(false);
  const [openingTimeout, setOpeningTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [closingTimeout, setClosingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  // those refs are necessary to get the current state inside timeouts
  const openedBookmarkRef = useRef(openedBookmark);
  openedBookmarkRef.current = openedBookmark;
  const hoveredBookmarkRef = useRef(hoveredBookmark);
  hoveredBookmarkRef.current = hoveredBookmark;

  useEffect(() => {
    if (openedBookmark && openingTimeout) {
      clearTimeout(openingTimeout);
      setOpeningTimeout(null);
    }
    if (openedBookmark && openedBookmark !== node.id && closingTimeout) {
      clearTimeout(closingTimeout);
      setClosingTimeout(null);
    }
  }, [openedBookmark]);
  useEffect(() => {
    if (!hoveredBookmark || hoveredBookmark !== node.id) {
      clearTimeout(openingTimeout);
      setOpeningTimeout(null);
    }
  }, [hoveredBookmark]);

  return (
    <Menu>
      {({ open, close }) => (
        <Float
          composable
          autoPlacement={{
            rootBoundary: "document",
            alignment: "start",
            allowedPlacements: ["right-start", "right-end"],
          }}
          offset={2}
        >
          <Float.Reference>
            <Menu.Button
              className="w-full"
              onClick={(event) => {
                // event.preventDefault();
                event.stopPropagation();
              }}
            >
              <FolderBookmark
                ref={buttonRef}
                node={node}
                onHover={() => {
                  if (hoveredBookmark !== node.id) {
                    setHoveredBookmark(node.id);
                  }
                  if (openedBookmark && openedBookmark !== node.id) {
                    openMenu();
                  } else if (!openedBookmark) {
                    setOpeningTimeout(setTimeout(openMenu, 500));
                  }
                }}
                onHoverOut={() => {
                  if (!hoveredSubmenu) {
                    setHoveredBookmark(null);
                    setClosingTimeout(
                      setTimeout(() => {
                        if (
                          hoveredBookmarkRef.current !== node.id &&
                          openedBookmarkRef.current &&
                          openedBookmarkRef.current === node.id
                        ) {
                          setHoveredSubmenu(false);
                          close();
                        }
                      }, 500),
                    );
                  }
                }}
                open={open}
                close={close}
                openMenu={openMenu}
                active={active}
                openedBookmark={openedBookmark}
                setOpenedBookmark={setOpenedBookmark}
              />
            </Menu.Button>
          </Float.Reference>
          <Float.Content>
            {open && (
              <Menu.Items
                static
                onMouseEnter={() => {
                  setHoveredSubmenu(true);
                  setHoveredBookmark(node.id);
                  clearTimeout(closingTimeout);
                  setClosingTimeout(null);
                }}
                onMouseLeave={() => {
                  setHoveredBookmark(null);
                  setHoveredSubmenu(false);
                  setClosingTimeout(
                    setTimeout(() => {
                      if (
                        hoveredBookmarkRef.current !== node.id &&
                        openedBookmarkRef.current &&
                        openedBookmarkRef.current === node.id
                      ) {
                        setHoveredSubmenu(false);
                        close();
                      }
                    }, 500),
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (activeFolder) {
                      setOpenedSubBookmark(activeFolder);
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }}
                className="max-w-[400px] max-h-[calc(100vh-35px)] overflow-y-scroll flex flex-col py-2 shadow-xl bg-chrome-dropdown-light dark:bg-chrome-dropdown-dark rounded-xl border-[1px] border-chrome-dropdown-border-light dark:border-chrome-dropdown-border-dark no-scrollbar"
              >
                {node.children.length > 0 ? (
                  node.children.map((child) => (
                    <DropdownItem
                      empty={false}
                      node={child}
                      openedSubBookmark={openedSubBookmark}
                      setOpenedSubBookmark={setOpenedSubBookmark}
                      hoveredSubBookmark={hoveredSubBookmark}
                      setHoveredSubBookmark={setHoveredSubBookmark}
                      setActiveFolder={setActiveFolder}
                    />
                  ))
                ) : (
                  <DropdownItem empty={true} />
                )}
              </Menu.Items>
            )}
          </Float.Content>
        </Float>
      )}
    </Menu>
  );
};

export default DropdownButton;
