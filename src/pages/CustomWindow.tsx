import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import FullWindowFixedList from "../FullWindowScroll";
import { Button, ButtonGroup } from "@material-ui/core";

export default function CustomWindow() {
  return <GeneralPage code={code} Demo={CustomWindowDemo} />;
}

function CustomWindowDemo() {
  const ref = React.useRef();
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  const containerStyle = {
    height: 500,
    width: "100%",
    overflowY: "scroll" as any,
  };

  const fillerStyle = {
    textAlign: "center" as any,
    padding: 20,
  };

  return (
    <div ref={ref as any} style={containerStyle}>
      <div style={fillerStyle}>some random ui</div>
      <div style={fillerStyle}>some random ui</div>
      <div style={fillerStyle}>some random ui</div>
      <Wrap
        rowComponent={Row}
        data={data}
        rowHeight={100}
        scrollRef={ref}
      />
    </div>
  );
}

function Wrap(props: any) {
  const {Row, data, ref} = props;
  const [autoRef, setRef] = React.useState<any>(ref);
  React.useEffect(() => {
    setRef(ref)
  }, ref?.current)

  return (
    <FullWindowFixedList
      rowComponent={Row}
      data={data}
      rowHeight={100}
      scrollRef={ref}
    />
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
    const { data, dataIndex } = props;

    const value = data[dataIndex];
    return <div>{value}</div>;
})`;
