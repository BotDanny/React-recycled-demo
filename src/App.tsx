import React from "react";
import logo from "./logo.svg";
import "./App.css";
import FixedList from "./FixedSizeList";
import VariableSizeList from "./VariableSizeList";
import { Grid } from "@material-ui/core";
import { FixedSizeList } from "react-window";
import { RowProps } from "./TypeDef";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRamdomRowHeightAndColumn(dataLength: number) {
  const heights: number[] = [];
  const columns: number[] = [];
  let nextDataIndex = 0;
  for (let i = 0; nextDataIndex < dataLength; i++) {
    heights[i] = randInt(60, 140);
    const column = randInt(1, 4);
    const tempNextDataIndex = nextDataIndex + column;
    columns[i] =
      tempNextDataIndex > dataLength ? dataLength - nextDataIndex : column;
    nextDataIndex = tempNextDataIndex;
  }

  return [heights, columns];
}

const initialData = Array(50)
  .fill(null)
  .map((_, index) => index);

function App() {
  const childRef = React.useRef() as React.RefObject<VariableSizeList>
  const [data, setData] = React.useState(initialData);
  const [test, setTest] = React.useState(false);
  const [heights, columns] = generateRamdomRowHeightAndColumn(data.length);
  return (
    <div className="App">
      <button
        onClick={() =>
          setData(
            Array(data.length + 3)
              .fill(null)
              .map((_, index) => index)
          )
        }
      >
        + Data
      </button>
      <button
        onClick={() =>
          setData(
            Array(data.length - 3)
              .fill(null)
              .map((_, index) => index)
          )
        }
      >
        - data
      </button>
      <button
        onClick={() => {
          childRef.current?.scrollToDataIndex(17)
        }}
      >
        scroll to data 17
      </button>
      <VariableSizeList
        ref={childRef}
        height={350}
        data={data}
        rowHeight={100}
        rowHeights={data.map(() => 100)}
        // rowHeights={heights}
        // rowColumns={columns}
        rowComponent={Row}
        width={"100%"}
        useScrollingIndicator
      />
    </div>
  );
}

function FixedListDemo() {
  const childRef = React.useRef() as React.RefObject<FixedList>
  const [data, setData] = React.useState(initialData);
  const [test, setTest] = React.useState(false);
  const [heights, columns] = generateRamdomRowHeightAndColumn(data.length);
  return (
    <div className="App">
      <button
        onClick={() =>
          setData(
            Array(data.length + 3)
              .fill(null)
              .map((_, index) => index)
          )
        }
      >
        + Data
      </button>
      <button
        onClick={() =>
          setData(
            Array(data.length - 3)
              .fill(null)
              .map((_, index) => index)
          )
        }
      >
        - data
      </button>
      <button
        onClick={() => {
          childRef.current?.scrollToDataIndex(17)
        }}
      >
        scroll to data 17
      </button>
      <FixedList
        ref={childRef}
        height={350}
        data={data}
        rowHeight={100}
        // rowHeights={heights}
        // rowColumns={columns}
        rowComponent={Row}
        width={"100%"}
      />
    </div>
  );
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, dataEndIndex, column, isScrolling } = props;
  const dataSection = data.slice(dataIndex, dataEndIndex);
  let xs: 12 | 6 | 4 | 3 = 12;
  if (column === 2) xs = 6;
  else if (column === 3) xs = 4;
  else if (column === 4) xs = 3;
  console.log(`item ${data[dataIndex]}`);
  return (
    <>
      {dataSection.map((dataItem, index) => {
        return (
          <Grid key={index} xs={xs}>
            {`item ${isScrolling? "scrolling" : dataItem}`}
          </Grid>
        );
      })}
    </>
  );
});

function ReactWindow() {
  const data = Array(50)
    .fill(null)
    .map((_, index) => index);
  const [heights, columns] = generateRamdomRowHeightAndColumn(data.length);
  return (
    <div className="App">
      <FixedSizeList
        className="react-recycled-list"
        height={300}
        itemCount={data.length}
        itemSize={100}
        width="100%"
      >
        {ReactWindowRow}
      </FixedSizeList>
    </div>
  );
}

const ReactWindowRow = React.memo(function (props: {
  index: number;
  style: any;
}) {
  const { index, style } = props;
  React.useEffect(() => {
    console.log(`${index} mounted`)
    return () => {
      console.log(`${index} unmounted`)
    }
  }, [])
  return (
    <div className="react-recycled-row" style={style}>
      <Grid key={index} xs={12}>
        Item {index}
      </Grid>
    </div>
  );
});

export default FixedListDemo;
