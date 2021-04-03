import React, { Component } from "react";
import * as _ from "lodash";
import {
  RowToDataIndexMap,
  calculateRowPositions,
  mapRowIndexToDataIndex,
  classNames,
} from "./utils";

export interface RowProps {
  data: any[];
  row: number;
  dataIndex: number;
  dataEndIndex: number;
  column: number;
}

interface props {
  height: number;
  width: string;
  data: any[];
  rowHeight: number;
  rowHeights: number[];
  rowComponent: React.ElementType<RowProps>;
  column?: number;
  rowColumns?: number[];
  additionalRenderedRow?: number;
  listWindowClassName?: string;
  listClassName?: string;
  listTagName?: string;
  rowTagName?: string;
  rowClassName?: string;
  useScrollingIndicator?: boolean;
}

interface state {
  renderedRowIndex: number[];
  topRenderedRowRelativeIndex: number;
  loadingState: boolean[];
}

export default class FixedList extends React.PureComponent<props, state> {
  rowPositions: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  calculatedRowColumns: number[];
  listRef: React.RefObject<HTMLElement>;
  prevScroll: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;

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

    this.validateProps();
    this.listRef = React.createRef();
    this.prevScroll = 0;

    this.calculatedRowColumns = rowColumns
      ? rowColumns
      : column
      ? Array(rowHeights.length).fill(column)
      : Array(rowHeights.length).fill(1);

    this.rowToDataIndexMap = mapRowIndexToDataIndex(
      this.calculatedRowColumns,
      data.length
    );
    this.rowPositions = calculateRowPositions(rowHeights);

    this.totalRows = rowHeights.length;
    if (this.rowToDataIndexMap[this.totalRows - 1][1] !== data.length) {
      throw Error(
        "The total number of data item calculated from rowHeights does not match the length of your input data"
      );
    }

    const numOfVisibleRow = Math.ceil(height / rowHeight);
    this.numOfInvisibleRowOnEachDirection =
      additionalRenderedRow || Math.ceil(numOfVisibleRow / 2);
    this.totalNumOfRenderedRows =
      numOfVisibleRow + this.numOfInvisibleRowOnEachDirection * 2;
    if (this.totalNumOfRenderedRows > this.totalRows)
      this.totalNumOfRenderedRows = this.totalRows;
    this.initialArrayTemplate = Array(this.totalNumOfRenderedRows).fill(null);

    this.fullHeight = rowHeights.reduce((acc, current) => acc + current, 0);

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      loadingState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  componentDidUpdate = (prevProps: any, prevState: any) => {
    const myProp = this.props;

    console.log("update");
  };

  mod = (n: number, m: number = this.totalNumOfRenderedRows) => {
    return ((n % m) + m) % m;
  };

  recycle = (scrollTop: number) => {
    const { height } = this.props;
    const {
      renderedRowIndex,
      topRenderedRowRelativeIndex,
      loadingState,
    } = this.state;
    const topScroll = scrollTop - this.prevScroll > 0 ? false : true;
    this.prevScroll = scrollTop;

    let rowsToRecycle = 0;
    if (topScroll) {
      const topRenderedRowIndex = renderedRowIndex[topRenderedRowRelativeIndex];
      const newTopRenderedRowIndex = Math.max(
        _.sortedLastIndex(this.rowPositions, scrollTop) -
          1 -
          this.numOfInvisibleRowOnEachDirection,
        0
      );
      rowsToRecycle = topRenderedRowIndex - newTopRenderedRowIndex;
    } else {
      const bottomRenderedRowIndex =
        renderedRowIndex[this.mod(topRenderedRowRelativeIndex - 1)];
      const viewportBottom = scrollTop + height;
      const newBottomRenderedRowIndex = Math.min(
        _.sortedIndex(this.rowPositions, viewportBottom) -
          1 +
          this.numOfInvisibleRowOnEachDirection,
        this.totalRows - 1
      );

      rowsToRecycle = newBottomRenderedRowIndex - bottomRenderedRowIndex;
    }

    if (rowsToRecycle > 0) {
      const newRenderedRowIndex = [...renderedRowIndex];
      const newLoadingState = [...loadingState];
      let cycle = 0;
      while (cycle < rowsToRecycle) {
        const newTopRenderedRowRelativeIndex = this.mod(
          topRenderedRowRelativeIndex + (topScroll ? -cycle - 1 : cycle)
        );

        newRenderedRowIndex[newTopRenderedRowRelativeIndex] += topScroll
          ? -this.totalNumOfRenderedRows
          : this.totalNumOfRenderedRows;

        newLoadingState[newTopRenderedRowRelativeIndex] = true;

        cycle++;
      }

      const newTopRenderedRowRelativeIndex = this.mod(
        topRenderedRowRelativeIndex +
          (topScroll ? -rowsToRecycle : rowsToRecycle)
      );

      this.setState({
        renderedRowIndex: newRenderedRowIndex,
        loadingState: newLoadingState,
        topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
      });
    }
  };

  onScroll = (event: React.UIEvent<HTMLElement>) => {
    this.recycle(event.currentTarget.scrollTop);
  };

  render() {
    const {
      listTagName,
      listClassName,
      listWindowClassName,
      data,
      height,
      width,
      rowComponent: MyComponent,
      rowTagName,
      rowHeights,
      rowClassName,
    } = this.props;
    const { renderedRowIndex } = this.state;

    const ListTag: any = listTagName || "div";
    const RowTag: any = rowTagName || "div";
    return (
      <div
        className={classNames(
          "react-recycled-list-window",
          listWindowClassName
        )}
        style={{
          height,
          width,
          overflowY: "scroll",
        }}
        onScroll={this.onScroll}
      >
        <ListTag
          className={classNames("react-recycled-list", listClassName)}
          style={{
            height: this.fullHeight,
            position: "relative",
          }}
        >
          {renderedRowIndex.map((absoluteRowIndex) => {
            const dataIndexInfo = this.rowToDataIndexMap[absoluteRowIndex];

            return (
              <RowTag
                style={{
                  position: "absolute",
                  top: this.rowPositions[absoluteRowIndex],
                  height: rowHeights[absoluteRowIndex],
                  width: "100%",
                  boxSizing: "border-box",
                }}
                className={classNames("react-recycled-row", rowClassName)}
              >
                <MyComponent
                  data={data}
                  dataIndex={dataIndexInfo[0]}
                  dataEndIndex={dataIndexInfo[1]}
                  row={absoluteRowIndex}
                  column={this.calculatedRowColumns[absoluteRowIndex]}
                />
              </RowTag>
            );
          })}
        </ListTag>
      </div>
    );
  }
}
