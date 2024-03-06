import { forwardRef, useEffect, useRef, useState } from "react";
import { Menu } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import Folder from "@assets/icons/Folder";
import DropdownItem from "@pages/popup/components/DropdownItem";

/*
  The hierarchy of components works like this:
  - <FavoriteButton>
    - if simple link -> link button
    - <FolderButton>
      - <DropdownItem>[]
        - if simple link -> link bookmark
        - <DropdownButton>
          - <FolderBookmark>
            - <DropdownItem>[]
             ...

  There is a complex opened/hovered state handling logic because of the uncontrolled nature of HeadlessUI's Menu.
  We register which bookmark is open/hovered at the parent level because there can be only one open at a time
  so all bookmarks have to be aware of which one is currently opened/hovered.
  We then use various useEffect hooks to sync the Menu's opened/closed state with the controlled state.
  We use onMouseEnter/onMouseLeave events to open/keep opened submenus on hover and when the submenu is itself hovered.
  We use timeouts to control delayed menu opening.
  We use keydown and onClick event interceptors to keep a decent keyboard/click navigation (not closing the menu on Enter/click).

*/

const FolderButton = forwardRef<
  HTMLDivElement,
  {
    textClass: string;
    wrapperClass: string;
    node: chrome.bookmarks.BookmarkTreeNode;
    onHover: () => void;
    openedBookmark: string | null;
    setOpenedBookmark: (id: string) => void;
    open: boolean;
    close: () => void;
  }
>(({ textClass, wrapperClass, node, openedBookmark, setOpenedBookmark, onHover, open, close }, ref) => {
  // handle "open" and "openedBookmark" sync in here because this is where we have access to both properties
  useEffect(() => {
    if (!open && openedBookmark === node.id) {
      setOpenedBookmark(null);
    } else if (open && openedBookmark !== node.id) {
      setOpenedBookmark(node.id);
    }
  }, [open]);
  useEffect(() => {
    if (open && openedBookmark !== node.id) {
      close();
    }
  }, [openedBookmark]);
  return (
    <div className={wrapperClass} onMouseEnter={onHover} ref={ref}>
      <div className="w-[18px] h-[18px]">
        <Folder />
      </div>
      <div className={textClass}>{node.title}</div>
    </div>
  );
});

const FavoriteButton = ({
  node,
  openedBookmark,
  setOpenedBookmark,
}: {
  node: chrome.bookmarks.BookmarkTreeNode;
  openedBookmark: string | null;
  setOpenedBookmark: (id: string) => void;
}) => {
  const buttonRef = useRef(null);
  const openMenu = () => buttonRef?.current?.click();
  const [openedSubBookmark, setOpenedSubBookmark] = useState<string | undefined>(null);
  const [hoveredSubBookmark, setHoveredSubBookmark] = useState<string | undefined>(null);
  const [activeFolder, setActiveFolder] = useState<string | undefined>(null);
  const wrapperClass =
    "cursor-pointer flex flex-row gap-1.5 items-center hover:bg-chrome-hover-light hover:dark:bg-chrome-hover-dark rounded-full px-1.5 py-1 min-w-[50px]";
  const textClass =
    "max-w-[110px] overflow-hidden whitespace-nowrap text-ellipsis text-xs text-chrome-text-light dark:text-chrome-text-dark leading-[18px]";

  // simple url bookmark
  if (!node.children) {
    const hostname = new URL(node.url).hostname;
    const iconUrl = hostname ? `http://www.google.com/s2/favicons?sz=64&domain=${hostname}` : null;
    return (
      <a className={wrapperClass} href={node.url}>
        {iconUrl ? <img className="w-[16px] h-[16px]" src={iconUrl}></img> : null}
        <div className={textClass}>{node.title}</div>
      </a>
    );
  }

  // dropdown bookmark
  return (
    <Menu>
      {({ open, close }) => (
        <Float
          composable
          autoPlacement={{
            rootBoundary: "document",
            alignment: "start",
            allowedPlacements: ["bottom-start", "bottom-end"],
          }}
          offset={3}
        >
          <Float.Reference>
            <Menu.Button>
              <FolderButton
                ref={buttonRef}
                wrapperClass={wrapperClass}
                textClass={textClass}
                node={node}
                onHover={() => {
                  if (openedBookmark && openedBookmark !== node.id) {
                    openMenu();
                  }
                }}
                open={open}
                close={close}
                openedBookmark={openedBookmark}
                setOpenedBookmark={setOpenedBookmark}
              />
            </Menu.Button>
          </Float.Reference>
          <Float.Content>
            {open && (
              <Menu.Items
                static
                className="max-w-[400px] max-h-[calc(100vh-35px)] overflow-y-scroll flex flex-col py-2 shadow-xl bg-chrome-dropdown-light dark:bg-chrome-dropdown-dark rounded-xl border-[1px] border-chrome-dropdown-border-light dark:border-chrome-dropdown-border-dark"
                onKeyDown={(event) => {
                  // catch Enter keydown on folder bookmarks to prevent the menu from closing (default Headless menu behavior)
                  if (event.key === "Enter") {
                    // this is a pretty dirty way to detect which bookmark is currently active but :
                    // - the active property is only visible by the bookmark item itself
                    // - the event has to be catched at this level
                    // so we bring the active folder's node id up with a state and treat it here...
                    if (activeFolder) {
                      setOpenedSubBookmark(activeFolder);
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }}
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

export default FavoriteButton;
