import { Button, Menu } from "antd";
import { Delete as DeleteOutlined, Down as DownOutlined, Edit as EditOutlined, Up as UpOutlined } from "@icon-park/react";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { OverflowTooltip } from "./OverflowTooltip";

export type BaseDataNavigationMenuNode = {
  key: string;
  title: string;
  kind: "category" | "table";
  icon: ReactNode;
  children?: BaseDataNavigationMenuNode[];
};

type BaseDataNavigationMenuProps = {
  nodes: BaseDataNavigationMenuNode[];
  selectedKey: string;
  openKeys: string[];
  onSelect: (key: string) => void;
  onOpenChange: (keys: string[]) => void;
  onEdit?: (node: BaseDataNavigationMenuNode) => void;
  onDelete?: (node: BaseDataNavigationMenuNode) => void;
  renderLeading?: (node: BaseDataNavigationMenuNode) => ReactNode;
  className?: string;
  showActions?: boolean;
  selectParent?: boolean;
};

function countTableNodes(nodes: BaseDataNavigationMenuNode[]): number {
  return nodes.reduce((count, node) => count + (node.kind === "table" ? 1 : 0) + (node.children ? countTableNodes(node.children) : 0), 0);
}

export function BaseDataNavigationMenu({
  nodes,
  selectedKey,
  openKeys,
  onSelect,
  onOpenChange,
  onEdit,
  onDelete,
  renderLeading,
  className = "",
  showActions = true,
  selectParent = true,
}: BaseDataNavigationMenuProps) {
  const navigationScrollRef = useRef<HTMLDivElement>(null);
  const [navigationScrollbar, setNavigationScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });

  useLayoutEffect(() => {
    const scrollElement = navigationScrollRef.current;
    if (!scrollElement) return;

    const updateScrollbar = () => {
      const trackHeight = Math.max(scrollElement.clientHeight - 8, 0);
      const scrollableHeight = Math.max(scrollElement.scrollHeight - scrollElement.clientHeight, 0);
      if (trackHeight <= 0 || scrollableHeight <= 0) {
        setNavigationScrollbar({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max((scrollElement.clientHeight / scrollElement.scrollHeight) * trackHeight, 24);
      const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
      setNavigationScrollbar({
        trackHeight,
        thumbHeight,
        thumbOffset: maxThumbOffset * (scrollElement.scrollTop / scrollableHeight),
      });
    };

    updateScrollbar();
    scrollElement.addEventListener("scroll", updateScrollbar, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(scrollElement);
    return () => {
      scrollElement.removeEventListener("scroll", updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [nodes, openKeys]);

  const handleNavigationScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scrollElement = navigationScrollRef.current;
    const maxThumbOffset = navigationScrollbar.trackHeight - navigationScrollbar.thumbHeight;
    const scrollableHeight = scrollElement ? scrollElement.scrollHeight - scrollElement.clientHeight : 0;
    if (!scrollElement || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = scrollElement.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      scrollElement.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const totalTableNodes = countTableNodes(nodes);
  const toItems = (items: BaseDataNavigationMenuNode[], depth = 0): NonNullable<React.ComponentProps<typeof Menu>["items"]> => items.map((node) => ({
    key: node.key,
    className: `nav-menu-depth-${depth}${selectedKey === node.key ? " nav-menu-node-selected" : ""}`,
    onTitleClick: node.children && selectParent ? () => onSelect(node.key) : undefined,
    label: (
      <span className={`nav-menu-label${selectedKey === node.key ? " nav-menu-label-selected" : ""}`}>
        {node.children && <span className="nav-menu-arrow">{openKeys.includes(node.key) ? <UpOutlined /> : <DownOutlined />}</span>}
        {renderLeading && <span className="nav-menu-leading" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>{renderLeading(node)}</span>}
        {!node.children && <span className="nav-menu-icon">{node.icon}</span>}
        <OverflowTooltip title={node.title} className="nav-menu-text">{node.title}</OverflowTooltip>
        {showActions && onEdit && onDelete && (
          <span className="nav-menu-actions" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
            <Button type="text" size="small" icon={<EditOutlined />} title="编辑导航名称" aria-label={`编辑${node.title}`} onClick={() => onEdit(node)} />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="删除导航项"
              aria-label={`删除${node.title}`}
              disabled={node.kind === "table" && totalTableNodes <= 1}
              onClick={() => onDelete(node)}
            />
          </span>
        )}
      </span>
    ),
    children: node.children ? toItems(node.children, depth + 1) : undefined,
  }));

  return (
    <div className="nav-menu-viewport">
      <div ref={navigationScrollRef} className="nav-menu-scroll">
        <Menu
          className={`nav-menu ${className}`}
          mode="inline"
          items={toItems(nodes)}
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => onOpenChange(keys as string[])}
          onClick={({ key }) => onSelect(String(key))}
          expandIcon={null}
        />
      </div>
      {navigationScrollbar.thumbHeight > 0 && (
        <div className="nav-menu-floating-scrollbar" style={{ height: navigationScrollbar.trackHeight }} aria-hidden="true">
          <div
            className="nav-menu-floating-scrollbar-thumb"
            style={{ height: navigationScrollbar.thumbHeight, transform: `translateY(${navigationScrollbar.thumbOffset}px)` }}
            onPointerDown={handleNavigationScrollbarPointerDown}
          />
        </div>
      )}
    </div>
  );
}
