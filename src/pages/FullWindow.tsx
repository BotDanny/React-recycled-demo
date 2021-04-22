import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import { FullWindowFixedList } from "../Export";

export default function FullWindow() {
  return (
    <>
      <div className="code-section half-section">
        <div className="code-wrapper">
          <Highlight language="js">{code}</Highlight>
        </div>
      </div>
      <div className="demo-section half-section">
        <FullWindowDemo />
      </div>
    </>
  );
}

function FullWindowDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return <FullWindowFixedList rowComponent={Row} data={data} rowHeight={100}/>;
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, style } = props;
  const value = data[dataIndex];
  return (
    <div
      style={style}
      className="react-recycled-row"
    >
      {value}
    </div>
  );
});

const code = `import { FullWindowFixedList, FullWindowVariableList } from "react-recycled-list";

// Important! FullWindowFixedList and FullWindowVariableList are not responsive by default!
// You must wrap in it the responsive container to make it responsive

function FullWindowDemo() {

    const data = Array(1000).fill(null).map((_, index) => \`index \${index}\`);

    // FullWindowFixedList is essentially the same as FixedList but without the height prop
    // FullWindowVariableList is essentially the same as VariableList but without the height prop

    return <FullWindowFixedList rowComponent={Row} data={data} rowHeight={100} />
}

// Use React.memo or React pure component to prevent unncessary render
const Row = React.memo(function (props) {
    // the data here is the same data that is passed into the FixedList
    const { data, dataIndex, style } = props;

    const value = data[dataIndex];
    return <div style={style} className="react-recycled-row">{value}</div>;
})`;