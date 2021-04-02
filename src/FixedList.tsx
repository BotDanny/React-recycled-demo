import React, { Component } from "react";

interface props {
  height: number;
  data: any[];
  rowHeight: number;
  rowHeights: number[];
  column?: number;
  rowColumns?: number[];
  additionalRenderedRow?: number;
}

interface state {
  renderedRowAbsoluteIndex: number[];
  topRenderedRowRelativeIndex: number;
  loadingState: boolean[];
}

function calculateRowPositions(rowHeights: number[]) {
  let prev = 0;
  const rowPositions: number[] = [];
  const rowCount = rowHeights.length;
  for (let i = 0; i < rowCount; i++) {
    if (i === 0) rowPositions[i] = 0;
    else rowPositions[i] = prev;
    prev += rowHeights[i];
  }
  return rowPositions;
}

type RowToDataIndexMap = { [key: string]: [number, number] };
function mapRowIndexToDataIndex(rowColumns: number[], totalNumOfData: number) {
  const rowCount = rowColumns.length;
  let prevEndDataIndex = 0;
  let map: RowToDataIndexMap = {};
  for (let i = 0; i < rowCount; i++) {
    const newEndDataIndex = Math.min(
      prevEndDataIndex + rowColumns[i],
      totalNumOfData
    );
    map[i] = [prevEndDataIndex, newEndDataIndex];
    prevEndDataIndex = newEndDataIndex;
  }
  return map;
}

export default class FixedList extends React.PureComponent<props, state> {
  rowPositions: number[];
  rowToDataIndexMap: { [key: string]: [number, number] };
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;

  validateProps = () => {
    const { rowHeight, rowHeights, column, rowColumns, data } = this.props;
    if (rowColumns) {
      if (
        rowColumns.reduce((acc, current) => acc + current, 0) !== data.length
      ) {
        throw Error(
          "The total number of data item calculated from rowColumns does not match the length of your input data"
        );
      }
      if (rowColumns.length !== rowHeights.length) {
        throw Error(
          "The number of rows provided from rowHeights does not match the number of rows provided from rowColumns"
        );
      }
    } else if (column) {
      const rows = Math.ceil(data.length / column);
      if (rows !== rowHeights.length) {
        throw Error(
          "The number of rows provided from rowHeights does not match the number of rows calculated from column"
        );
      }
    } else if (rowHeights.length !== data.length) {
      throw Error(
        "The number of rows provided from rowHeights does not match the number of rows calculated from your input data"
      );
    }
  };

  constructor(props: props) {
    super(props);

    const {
      rowHeight,
      rowHeights,
      column,
      rowColumns,
      data,
      height,
      additionalRenderedRow,
    } = props;

    this.validateProps()

    const calculatedRowColumns: number[] = rowColumns
      ? rowColumns
      : column
      ? Array(rowHeights.length).fill(column)
      : Array(rowHeights.length).fill(1);

    this.rowToDataIndexMap = mapRowIndexToDataIndex(
      calculatedRowColumns,
      data.length
    );
    this.rowPositions = calculateRowPositions(rowHeights);

    const totalRows = rowHeights.length;
    if (this.rowToDataIndexMap[totalRows - 1][1] !== data.length) {
      throw Error(
        "The total number of data item calculated from rowHeights does not match the length of your input data"
      );
    }

    const numOfVisibleRow = Math.ceil(height / rowHeight);
    const numOfInvisibleRowOnEachDirection =
      additionalRenderedRow || Math.ceil(numOfVisibleRow / 2);
    this.totalNumOfRenderedRows =
      numOfVisibleRow + numOfInvisibleRowOnEachDirection * 2;
    if (this.totalNumOfRenderedRows < totalRows)
      this.totalNumOfRenderedRows = totalRows;
    this.initialArrayTemplate = Array(this.totalNumOfRenderedRows).fill(null);

    this.fullHeight = rowHeights.reduce((acc, current) => acc + current, 0);

    this.state = {
      renderedRowAbsoluteIndex: this.initialArrayTemplate.map(
        (_, index) => index
      ),
      loadingState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  render() {
    return <div></div>;
  }
}
