import React, { Component } from "react";
import * as _ from "lodash";
import {
  RowToDataIndexMap,
  calculateRowPositions,
  mapRowIndexToDataIndex,
  classNames,
} from "./utils";
import { ReactRecycledListProps, ReactRecycledListState } from "./TypeDef";
import GeneralList from "./AbstractList";

interface props extends ReactRecycledListProps {
  rowHeights: number[];
}

export default class VariableSizeList extends GeneralList<
  props,
  ReactRecycledListState
> {
  rowPositions: number[];
  rowHeights: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  timeOut: any;

  initializeProperties = () => {
    const {
      rowHeight,
      rowHeights,
      column,
      rowColumns,
      data,
      height,
      additionalRenderedRow,
    } = this.props;

    // Validate

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

    const calculatedRowColumns = rowColumns
      ? rowColumns
      : column
      ? Array(rowHeights.length).fill(column)
      : Array(rowHeights.length).fill(1);

    const rowToDataIndexMap = mapRowIndexToDataIndex(
      calculatedRowColumns,
      data.length
    );
    const rowPositions = calculateRowPositions(rowHeights);
    const totalRows = rowHeights.length;

    const numOfVisibleRow = Math.ceil(height / rowHeight);
    const numOfInvisibleRowOnEachDirection =
      additionalRenderedRow || Math.ceil(numOfVisibleRow / 2);
    let totalNumOfRenderedRows =
      numOfVisibleRow + numOfInvisibleRowOnEachDirection * 2;
    if (totalNumOfRenderedRows > totalRows) totalNumOfRenderedRows = totalRows;
    const initialArrayTemplate = Array(totalNumOfRenderedRows).fill(null);

    const fullHeight = rowHeights.reduce((acc, current) => acc + current, 0);

    return {
      rowToDataIndexMap,
      rowPositions,
      totalRows,
      initialArrayTemplate,
      fullHeight,
      totalNumOfRenderedRows,
      numOfInvisibleRowOnEachDirection,
      rowHeights
    };
  };

  constructor(props: props) {
    super(props);
    const {
      rowToDataIndexMap,
      rowPositions,
      totalRows,
      initialArrayTemplate,
      fullHeight,
      totalNumOfRenderedRows,
      numOfInvisibleRowOnEachDirection,
      rowHeights
    } = this.initializeProperties();

    this.rowToDataIndexMap = rowToDataIndexMap;
    this.rowPositions = rowPositions;
    this.totalRows = totalRows;
    this.initialArrayTemplate = initialArrayTemplate;
    this.fullHeight = fullHeight;
    this.totalNumOfRenderedRows = totalNumOfRenderedRows;
    this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
    this.rowHeights = rowHeights;

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  componentDidUpdate(prevProps: props) {
    const currentProp = this.props;
    if (prevProps === currentProp) return;
    const {
      rowHeight,
      rowHeights,
      column,
      rowColumns,
      height,
      data,
      additionalRenderedRow,
    } = currentProp;
    if (
      prevProps.rowHeight !== rowHeight ||
      prevProps.rowHeights !== rowHeights ||
      prevProps.column !== column ||
      prevProps.rowColumns !== rowColumns ||
      prevProps.height !== height ||
      prevProps.data !== data ||
      prevProps.additionalRenderedRow !== additionalRenderedRow
    ) {
      const {
        rowToDataIndexMap,
        rowPositions,
        totalRows,
        initialArrayTemplate,
        fullHeight,
        totalNumOfRenderedRows,
        numOfInvisibleRowOnEachDirection,
      } = this.initializeProperties();

      this.rowToDataIndexMap = rowToDataIndexMap;
      this.rowPositions = rowPositions;
      this.totalRows = totalRows;
      this.initialArrayTemplate = initialArrayTemplate;
      this.fullHeight = fullHeight;
      this.totalNumOfRenderedRows = totalNumOfRenderedRows;
      this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
      this.rowHeights = rowHeights;
      this.resetList()
    }
  }

  getTopViewportRowIndex = (scrollTop: number) => {
    return _.sortedLastIndex(this.rowPositions, scrollTop) - 1;
  };

  getBottomViewportRowIndex = (viewportBottom: number) => {
    return _.sortedIndex(this.rowPositions, viewportBottom) - 1;
  };

}
