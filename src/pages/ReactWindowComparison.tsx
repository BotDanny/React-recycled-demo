import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import { FixedSizeGrid, FixedSizeList } from "react-window";

export default function ReactWindowComparison() {
  return <GeneralPage code={code} Demo={ReactWindow} />;
}

function ReactWindow() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => index);
  // const [heights, columns] = generateRamdomRowHeightAndColumn(data.length);
  return (
    <div className="App">
      <FixedSizeList height={500} itemSize={100} width="100%" itemCount={data.length}>
        {ReactWindowRow}
      </FixedSizeList>
    </div>
  );
}

const ReactWindowRow = React.memo(function (props: any) {
  const { index, style } = props;
  return (
    <div className="react-recycled-row" style={style}>
      {`item ${index}`}
    </div>
  );
});
function SimpleListDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return (
    <FixedList height={500} rowComponent={Row} data={data} rowHeight={100} />
  );
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex } = props;
  const value = data[dataIndex];
  return (
    <div
      key={dataIndex}
      style={{
        textAlign: "center",
      }}
    >
      {value}
    </div>
  );
});

const code = `import { FixedList } from "react-recycled-list";

function SimpleListDemo() {

  const data = Array(1000).fill(null).map((_, index) => \`index \${index}\`);

  return <FixedList height={500} rowComponent={Row} data={data} rowHeight={100}/>
}

// Use React.memo or React pure component to prevent unncessary render
const Row = React.memo(function (props) {
  // the data here is the same data that is passed into the FixedList
  const { data, dataIndex } = props;

  // Note, the css you see in the demo above is not defined here, check the code sandbox for more

  const value = data[dataIndex];
  return <div>{value}</div>;
})`;
