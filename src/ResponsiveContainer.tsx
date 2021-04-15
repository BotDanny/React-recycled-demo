import React, { Component } from "react";
import { useResizeDetector } from "react-resize-detector";
import { classNames } from "./utils";
import { addListener, removeListener } from "resize-detector";
interface ResponsiveContainerProps {
  render: (sizeInfo: { width: number; height: number }) => React.ReactNode;
  className?: string;
  debounceResize?: boolean;
  debounceInterval?: number;
  serverSideHeight?: number;
}

export default function ResponsiveContainer(props: ResponsiveContainerProps) {
  const {
    render,
    className,
    debounceResize,
    debounceInterval,
    serverSideHeight,
  } = props;
  const { width, height, ref } = useResizeDetector({
    refreshMode: debounceResize ? "debounce" : undefined,
    refreshRate: debounceInterval ? debounceInterval : 100,
  });
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    if (serverSideHeight !== undefined) {
      setHasMounted(true);
    }
  });
  return (
    <div
      className={classNames("react-recycled-responsive-container", className)}
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {render({
        width: width || 0,
        height: height || (!hasMounted && serverSideHeight) || 0,
      })}
    </div>
  );
}

// To watch for window scroll height change, add a 100vh invisible div and attack a the resize ref there.

interface FullWindowResponsiveContainerProps extends ResponsiveContainerProps{
  scrollContainerRef?: React.MutableRefObject<any>
}

export function FullWindowResponsiveContainer(props: FullWindowResponsiveContainerProps) {
  const {
    render,
    debounceResize,
    debounceInterval,
    serverSideHeight,
    scrollContainerRef
  } = props;
  const targetRef = React.useRef<HTMLDivElement>();
  const { width, height } = useResizeDetector({
    refreshMode: debounceResize ? "debounce" : undefined,
    refreshRate: debounceInterval ? debounceInterval : 100,
    targetRef: "scrollContainerRef" in props? scrollContainerRef : targetRef,
  });
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    if (serverSideHeight !== undefined) {
      setHasMounted(true);
    }
  });
  console.log(height)
  return (
    <>
      {render({
        width: width || 0,
        height: height || (!hasMounted && serverSideHeight) || 0,
      })}

      <div ref={targetRef as React.RefObject<HTMLDivElement>} style={{position: "fixed", height: "100vh", width: '100vw'}}/>
    </>
  );
}
