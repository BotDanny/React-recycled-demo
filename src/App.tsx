import React from "react";
import logo from "./logo.svg";
import "./App.css";
import FixedList, { RowProps } from "./FixedList";
import { Grid } from "@material-ui/core";

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

function App() {
  const data = Array(50)
    .fill(null)
    .map((_, index) => index);
  const [heights, columns] = generateRamdomRowHeightAndColumn(data.length);
  return (
    <div className="App">
      <FixedList
        height={350}
        data={data}
        rowHeight={100}
        rowHeights={heights}
        rowColumns={columns}
        rowComponent={Row}
        width={"100%"}
      />
    </div>
  );
}

function Row(props: RowProps) {
  const { data, dataIndex, dataEndIndex, column } = props;
  const dataSection = data.slice(dataIndex, dataEndIndex);
  let xs: 12 | 6 | 4 | 3 = 12;
  if (column === 2) xs = 6;
  else if (column === 3) xs = 4;
  else if (column === 4) xs = 3;
  return (
    <>
      {dataSection.map((dataItem, index) => {
        return (
          <Grid key={index} xs={xs}>
            {`item ${dataItem}`}
          </Grid>
        );
      })}
    </>
  );
}

export default App;
