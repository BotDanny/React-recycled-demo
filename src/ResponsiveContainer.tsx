import React, { Component } from "react";
import { useResizeDetector } from "react-resize-detector";
import { classNames } from "./utils";

interface ResponsiveContainerProps {
  render: (sizeInfo: { width: number; height: number }) => React.ReactNode;
  className?: string;
  debounceResize?: boolean;
  debounceInterval?: number;
}

export default function ResponsiveContainer(props: ResponsiveContainerProps) {
  const { render, className, debounceResize, debounceInterval } = props;
  const { width, height, ref } = useResizeDetector({
    refreshMode: debounceResize ? "debounce" : undefined,
    refreshRate: debounceInterval ? debounceInterval : 100,
  });
  return (
    <div
      className={classNames("react-recycled-responsive-container", className)}
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {width !== undefined && height !== undefined && render({ width, height })}
    </div>
  );
}

class Test extends Component<{
  width: number | undefined;
  height: number | undefined;
}> {
  render() {
    return (
      <div>
        {this.props.height}px height and {this.props.width}px width
      </div>
    );
  }
}
