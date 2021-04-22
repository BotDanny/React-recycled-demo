import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import { Avatar, Chip, CircularProgress } from "@material-ui/core";

export default function ScrollIndicator() {
  return <GeneralPage code={code} Demo={ScrollIndicatorDemo} />;
}

function ScrollIndicatorDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return (
    <FixedList height={500} rowComponent={Row} data={data} rowHeight={100} useScrollingIndicator/>
  );
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, isScrolling } = props;
  const value = isScrolling? "scrolling" : data[dataIndex];
  return <div key={dataIndex}>{value}</div>;
});

const code = `import { FixedList } from "react-recycled-list";

// If your row component is expensive to render, you can consider rendering a lighter component when scrolling

function ScrollIndicatorDemo() {
  const data = Array(1000).fill(null).map((_, index) => \`index \${index}\`);

  return <FixedList height={500} rowComponent={Row} data={data} rowHeight={100} useScrollingIndicator/>
}

const Row = React.memo(function (props: RowProps) {
    const { data, dataIndex, isScrolling } = props;
    const value = isScrolling? "scrolling" : data[dataIndex];
    return <div key={dataIndex}>{value}</div>;
});`;
