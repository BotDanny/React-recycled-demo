import React from "react";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import FullWindowResponsiveContainer from "../FullWindowResponsiveContainer";
import { FullWindowFixedList } from "../Export";

export default function FullWindowResponsiveContainerPage() {
  return (
    <>
      <div className="code-section half-section">
        <div className="code-wrapper">
          <Highlight language="js">{code}</Highlight>
        </div>
      </div>
      <div className="demo-section half-section">
        <FullWindowResponsiveContainerDemo />
      </div>
    </>
  );
}

function FullWindowResponsiveContainerDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  const renderList = (sizeInfo: { width: number; height: number }) => {
    console.log(sizeInfo);
    const { width, height } = sizeInfo;
    const column = width > 1200 ? 2 : 1;
    return (
      <FullWindowFixedList
        windowHeight={height}
        rowComponent={Row}
        data={data}
        rowHeight={100}
        column={column}
      />
    );
  };
  return <FullWindowResponsiveContainer render={renderList} />;
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, dataEndIndex, column, top, height } = props;
  const rowData = data.slice(dataIndex, dataEndIndex);

  const columnStyle = {
    width: column === 1 ? "100%" : "50%",
    textAlign: "center" as any,
  };
  return (
    <div style={{top, height}} className="react-recycled-row">
      {rowData.map((item) => (
        <div style={columnStyle}>{item}</div>
      ))}
    </div>
  );
});

const code = `import { FullWindowResponsiveContainer, FullWindowFixedList } from "react-recycled-list";

// Try resizing the window, the column will change on the 1200px break point

function FullWindowResponsiveContainerDemo() {
    const data = Array(1000).fill(null).map((_, index) => \`item \${index}\`);
  
    const renderList = (sizeInfo) => {
      const { width, height } = sizeInfo;
      const column = width > 1200 ? 2 : 1;
      return (
        <FullWindowFixedList
                        windowHeight={sizeInfo.height}
                        rowComponent={Row}
                        data={data}
                        rowHeight={100}
                        column={column}
                />
      );
    };
  
    return <FullWindowResponsiveContainer render={renderList} />;
}

const Row = React.memo(function (props) {
    const { data, dataIndex: dataStartIndex, dataEndIndex, column, top, height } = props;
    const rowData = data.slice(dataStartIndex, dataEndIndex);

    const columnStyle = {
      width: column === 1? "100%" : "50%",
      textAlign: "center",
    };
    return (
      <div style={{top, height}} className="react-recycled-row">
                        {rowData.map((item) => <div style={columnStyle}>{item}</div>)}
            </div>
    );
});`;
