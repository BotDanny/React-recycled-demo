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
  renderedRowAbsoluteIndex: number[];
  topRenderedRowRelativeIndex: number;
  loadingState: boolean[];
}

export default class FixedList extends React.PureComponent<props, state> {
  rowPositions: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  calculatedRowColumns: number[]

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
      numOfVisibleRow + (numOfInvisibleRowOnEachDirection * 2);
    if (this.totalNumOfRenderedRows > totalRows)
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

  recycle = (scrollTop: number) => {};

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
    const { renderedRowAbsoluteIndex } = this.state;

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
          overflow: "scroll",
        }}
      >
        <ListTag
          className={classNames("react-recycled-list", listClassName)}
          style={{
            height: this.fullHeight,
          }}
        >
          {renderedRowAbsoluteIndex.map((absoluteRowIndex) => {
            const dataIndexInfo = this.rowToDataIndexMap[absoluteRowIndex];

            return (
              <RowTag
                style={{
                  top: this.rowPositions[absoluteRowIndex],
                  height: rowHeights[absoluteRowIndex],
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
