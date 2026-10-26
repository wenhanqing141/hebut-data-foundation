import { Tooltip } from "antd";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type OverflowTooltipProps = {
  title: string;
  className?: string;
  children: ReactNode;
};

export function OverflowTooltip({ title, className, children }: OverflowTooltipProps) {
  const contentRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateOverflowState = () => {
      setIsOverflowing(content.scrollWidth > content.clientWidth + 1 || content.scrollHeight > content.clientHeight + 1);
    };

    updateOverflowState();
    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, [title]);

  return (
    <Tooltip title={isOverflowing ? title : undefined}>
      <span ref={contentRef} className={className}>{children}</span>
    </Tooltip>
  );
}
