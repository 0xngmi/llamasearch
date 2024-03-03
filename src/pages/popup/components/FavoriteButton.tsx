import { forwardRef, useEffect, useRef } from "react";
import { Menu } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import Folder from "@pages/popup/components/Folder";
import Caret from "@pages/popup/components/Caret";

const FolderButton = forwardRef<
  HTMLDivElement,
  {
    textClass: string;
    wrapperClass: string;
    node: chrome.bookmarks.BookmarkTreeNode;
    // onClick: () => void;
    onHover: () => void;
    openedBookmark: string | null;
    setOpenedBookmark: (id: string) => void;
    open: boolean;
    close: () => void;
  }
>(({ textClass, wrapperClass, node, openedBookmark, setOpenedBookmark, onHover, open, close }, ref) => {
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
  const wrapperClass =
    "cursor-pointer flex flex-row gap-1.5 items-center hover:bg-chrome-hover-light hover:dark:bg-chrome-hover-dark rounded-full px-1.5 py-1 min-w-[50px]";
  const textClass =
    "max-w-[110px] overflow-hidden whitespace-nowrap text-ellipsis text-xs text-chrome-text-light dark:text-chrome-text-dark leading-[18px]";
  const dropdownWrapperClass = (active: boolean) =>
    `cursor-pointer flex flex-row items-center gap-1.5 px-5 py-1 text-[13px] ${
      active ? "bg-chrome-dropdown-hover-light dark:bg-chrome-dropdown-hover-dark" : ""
    }`;
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
                // onClick={() => {
                //   if (!openedBookmark) {
                //     setOpenedBookmark(node.id);
                //   } else {
                //     setOpenedBookmark(null);
                //   }
                // }}
                onHover={() => {
                  if (openedBookmark && openedBookmark !== node.id) {
                    console.log(buttonRef);

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
              >
                {node.children.map((child) => {
                  if (child.children) {
                    return (
                      <Menu.Item>
                        {({ active }) => (
                          <div className={dropdownFolderWrapperClass(active)}>
                            <div className={dropdownFolderTextWrapperClass}>
                              <div className="w-[18px] h-[18px]">
                                <Folder />
                              </div>
                              <div className={dropdownTextClass(active)}>{child.title}</div>
                            </div>
                            <div className="w-[10px] h-[10px]">
                              <Caret />
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    );
                  }
                  const hostname = new URL(child.url).hostname;
                  const iconUrl = hostname ? `http://www.google.com/s2/favicons?sz=64&domain=${hostname}` : null;
                  return (
                    <Menu.Item>
                      {({ active }) => (
                        <a className={dropdownWrapperClass(active)} href={child.url}>
                          {iconUrl ? <img className="w-[16px] h-[16px]" src={iconUrl}></img> : null}
                          <div className={dropdownTextClass(active)}>{child.title}</div>
                        </a>
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            )}
          </Float.Content>
        </Float>
      )}
    </Menu>
    // <div className={wrapperClass}>
    //   <div className="w-[18px] h-[18px]">
    //     <Folder />
    //   </div>
    //   <div className={textClass}>{node.title}</div>
    // </div>
  );
};

export default FavoriteButton;
