import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import { Avatar, Chip, CircularProgress } from "@material-ui/core";

export default function SimpleList() {
  return <GeneralPage code={code} Demo={SimpleListDemo} />;
}

function SimpleListDemo() {
  const data = Array(1000)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return (
    <FixedList height={500} rowComponent={Row} data={data} rowHeight={100} />
  );
}


const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, top, height } = props;
  const value = data[dataIndex];
  React.useEffect(() => {
    console.log("render");
    return () => {
      console.log("unmount");
    };
  }, []);
  return <div style={{top, height}} className="react-recycled-row">{value}</div>;
});

const code = `import { FixedList } from "react-recycled-list";

function SimpleListDemo() {

  const data = Array(1000).fill(null).map((_, index) => \`index \${index}\`);

  return <FixedList height={500} rowComponent={Row} data={data} rowHeight={100}/>
}

// Use React.memo or React pure component to prevent unncessary render
const Row = React.memo(function (props) {
  // the data here is the same data that is passed into the FixedList
  const { data, dataIndex, top, height } = props;

  // Note, the css you see in the demo above is not defined here, check the code sandbox for more

  const value = data[dataIndex];
  // Important!, make sure you inline-style your component with the style props that's been provided. It contains top, height, and position
  return <div style={{top, height}} className="react-recycled-row">{value}</div>;
})`;
