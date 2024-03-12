import { useEffect } from "react";
import { Menu } from "@headlessui/react";
import DropdownButton from "@pages/popup/components/DropdownButton";

const ActiveSync = ({
  nodeId,
  active,
  isFolder,
  setActiveFolder,
}: {
  nodeId: string;
  active: boolean;
  isFolder: boolean;
  setActiveFolder: (nodeId: string | undefined) => void;
}) => {
  useEffect(() => {
    if (active) {
      if (isFolder) {
        setActiveFolder(nodeId);
      } else {
        setActiveFolder(undefined);
      }
    }
  }, [active]);
  return null;
};

const DropdownItem = ({
  empty,
  node,
  openedSubBookmark,
  setOpenedSubBookmark,
  hoveredSubBookmark,
  setHoveredSubBookmark,
  setActiveFolder,
}:
  | {
      empty: false;
      node: chrome.bookmarks.BookmarkTreeNode;
      openedSubBookmark: string | null;
      setOpenedSubBookmark: (id: string) => void;
      hoveredSubBookmark: string | null;
      setHoveredSubBookmark: (id: string) => void;
      setActiveFolder: (nodeId: string | undefined) => void;
    }
  | {
      empty: true;
      node?: never;
      openedSubBookmark?: never;
      setOpenedSubBookmark?: never;
      hoveredSubBookmark?: never;
      setHoveredSubBookmark?: never;
      setActiveFolder?: never;
    }) => {
  const dropdownWrapperClass = (active: boolean) =>
    `cursor-pointer flex flex-row items-center gap-1.5 px-5 py-1 text-[13px] ${
      active ? "bg-chrome-dropdown-hover-light dark:bg-chrome-dropdown-hover-dark" : ""
    }`;
  const dropdownTextClass = (active: boolean) =>
    `text-[13px] overflow-hidden whitespace-nowrap text-ellipsis ${
      active
        ? "text-chrome-dropdown-text-hover-light dark:text-chrome-dropdown-text-hover-dark"
        : "text-chrome-dropdown-text-light dark:text-chrome-dropdown-text-dark"
    }`;

  if (empty) {
    return (
      <Menu.Item>
        {({ active }) => (
          <div className={dropdownWrapperClass(active)}>
            <div className={dropdownTextClass(active)}>Empty</div>
          </div>
        )}
      </Menu.Item>
    );
  }
  if (node.children) {
    return (
      <Menu.Item>
        {({ active }) => (
          <div className="w-full">
            <ActiveSync nodeId={node.id} active={active} setActiveFolder={setActiveFolder} isFolder={true} />
            <DropdownButton
              node={node}
              active={active}
              openedBookmark={openedSubBookmark}
              setOpenedBookmark={setOpenedSubBookmark}
              hoveredBookmark={hoveredSubBookmark}
              setHoveredBookmark={setHoveredSubBookmark}
            />
          </div>
        )}
      </Menu.Item>
    );
  }
  const hostname = new URL(node.url).hostname;
  const iconUrl = hostname ? `http://www.google.com/s2/favicons?sz=64&domain=${hostname}` : null;
  return (
    <Menu.Item>
      {({ active }) => (
        <a className={dropdownWrapperClass(active)} href={node.url}>
          {iconUrl ? <img className="w-[16px] h-[16px]" src={iconUrl}></img> : null}
          <div className={dropdownTextClass(active)}>{node.title}</div>
          <ActiveSync nodeId={node.id} active={active} setActiveFolder={setActiveFolder} isFolder={false} />
        </a>
      )}
    </Menu.Item>
  );
};

export default DropdownItem;
