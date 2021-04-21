import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";

export default function SimpleGrid() {
  return <GeneralPage code={code} Demo={SimpleGridDemo} />;
}

function SimpleGridDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return (
    <FixedList
      height={300}
      rowComponent={Row}
      data={data}
      rowHeight={100}
      column={4}
    />
  );
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, dataEndIndex } = props;
  const rowData = data.slice(dataIndex, dataEndIndex);

  const rowStyle = {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
  };

  const columnStyle = {
    width: "25%",
    textAlign: "center" as any,
  };
  return (
    <div key={dataIndex} style={rowStyle}>
      {rowData.map((item) => (
        <div style={columnStyle}>{item}</div>
      ))}
    </div>
  );
});

const code = `import { FixedList } from "react-recycled-list";

function SimpleGridDemo() {
    const data = Array(1000).fill(null).map((_, index) => \`item \${index}\`);
    return <FixedList height={300} rowComponent={Row} data={data} rowHeight={100} column={4} />
}

const Row = React.memo(function (props) {
    const { data, dataIndex: dataStartIndex, dataEndIndex } = props;

    // You are given the start and end index of the data in this row. You style and arrange the columns yourself
    // Note the data item at dataEndIndex is not included in the row. If dataIndex = 0 and dataEndIndex = 3 then the data in this row is 0, 1 and 2

    const rowData = data.slice(dataStartIndex, dataEndIndex);
    // Note you don't have to use in-line styling, you can style it however you want
    const rowStyle = {
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
    };
    const columnStyle = {
        width: "25%",
        textAlign: "center",
    };
    return (
        <div key={dataIndex} style={rowStyle}>
                            {rowData.map((item) => <div style={columnStyle} key={item}>{item}</div>)}
                 </div>
    )
});`;
