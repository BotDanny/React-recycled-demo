import React, { Component } from "react";
import { useResizeDetector } from "react-resize-detector";
import { classNames } from "./utils";
import { addListener, removeListener } from "resize-detector";
import { ResponsiveContainerProps } from "./ResponsiveContainer";
interface FullWindowResponsiveContainerProps extends ResponsiveContainerProps {
  scrollContainerRef?: React.MutableRefObject<any>;
}

export default function FullWindowResponsiveContainer(
  props: FullWindowResponsiveContainerProps
) {
  const {
    render,
    debounceResize,
    debounceInterval,
    serverSideHeight,
    scrollContainerRef,
  } = props;
  const targetRef = React.useRef<HTMLDivElement>();
  const { width, height } = useResizeDetector({
    refreshMode: debounceResize ? "debounce" : undefined,
    refreshRate: debounceInterval ? debounceInterval : 100,
    targetRef: "scrollContainerRef" in props ? scrollContainerRef : targetRef,
  });
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    if (serverSideHeight !== undefined) {
      setHasMounted(true);
    }
  });
  return (
    <>
      {render({
        width: width || 0,
        height: height || (!hasMounted && serverSideHeight) || 0,
      })}

      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        style={{ position: "fixed", height: "100vh", width: "100vw" }}
      />
    </>
  );
}
