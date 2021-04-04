import React, { Component } from "react";
import * as _ from "lodash";
import {
  RowToDataIndexMap,
  calculateRowPositions,
  mapRowIndexToDataIndex,
  classNames,
  validateScrollTo,
} from "./utils";

export interface RowProps {
  data: any[];
  row: number;
  dataIndex: number;
  dataEndIndex: number;
  column: number;
  isScrolling: boolean;
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
  scrollInterval?: number;
}

interface state {
  renderedRowIndex: number[];
  topRenderedRowRelativeIndex: number;
  scrollState: boolean[];
}

export default class VariableSizeList extends React.PureComponent<props, state> {
  rowPositions: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  calculatedRowColumns: number[];
  listRef: React.RefObject<HTMLDivElement>;
  prevScroll: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  private _timeOut: any;

  validateProps = () => {
    const { rowHeights, column, rowColumns, data } = this.props;
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

  _debounceScrollState = () => {
    clearTimeout(this._timeOut);
    this._timeOut = setTimeout(() => {
      this.setState({
        scrollState: this.initialArrayTemplate.map(() => false),
      });
    }, this.props.scrollInterval || 250);
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
      this.totalRows = rowHeights.length;

      const numOfVisibleRow = Math.ceil(height / rowHeight);
      this.numOfInvisibleRowOnEachDirection =
        additionalRenderedRow || Math.ceil(numOfVisibleRow / 2);
      this.totalNumOfRenderedRows =
        numOfVisibleRow + this.numOfInvisibleRowOnEachDirection * 2;
      if (this.totalNumOfRenderedRows > this.totalRows)
        this.totalNumOfRenderedRows = this.totalRows;
      this.initialArrayTemplate = Array(this.totalNumOfRenderedRows).fill(null);

      this.fullHeight = rowHeights.reduce((acc, current) => acc + current, 0);

      const bottomRenderedRowIndex = this.totalNumOfRenderedRows - 1;
      const viewportBottom = this.prevScroll + height;
      const newBottomRenderedRowIndex = Math.min(
        _.sortedIndex(this.rowPositions, viewportBottom) -
          1 +
          this.numOfInvisibleRowOnEachDirection,
        this.totalRows - 1
      );

      const rowsToRecycle = newBottomRenderedRowIndex - bottomRenderedRowIndex;

      if (rowsToRecycle > 0) {
        const newRenderedRowIndex = this.initialArrayTemplate.map(
          (_, index) => index
        );
        const newScrollState = this.initialArrayTemplate.map(() => false);
        let cycle = 0;
        while (cycle < rowsToRecycle) {
          const newTopRenderedRowRelativeIndex = this.mod(cycle);
          newRenderedRowIndex[
            newTopRenderedRowRelativeIndex
          ] += this.totalNumOfRenderedRows;
          newScrollState[newTopRenderedRowRelativeIndex] = true;
          cycle++;
        }
        this.setState({
          renderedRowIndex: newRenderedRowIndex,
          scrollState: newScrollState,
          topRenderedRowRelativeIndex: this.mod(rowsToRecycle),
        });
      } else this.forceUpdate();

      if (this.fullHeight - height < this.prevScroll)
        this.prevScroll = this.fullHeight - height;
    }
  }

  mod = (n: number, m: number = this.totalNumOfRenderedRows) => {
    return ((n % m) + m) % m;
  };

  recycle = (scrollTop: number) => {
    const { height, useScrollingIndicator } = this.props;
    const {
      renderedRowIndex,
      topRenderedRowRelativeIndex,
      scrollState,
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
      const newScrollState = [...scrollState];
      let cycle = 0;
      while (cycle < rowsToRecycle) {
        const newTopRenderedRowRelativeIndex = this.mod(
          topRenderedRowRelativeIndex + (topScroll ? -cycle - 1 : cycle)
        );

        newRenderedRowIndex[newTopRenderedRowRelativeIndex] += topScroll
          ? -this.totalNumOfRenderedRows
          : this.totalNumOfRenderedRows;

        newScrollState[newTopRenderedRowRelativeIndex] = true;

        cycle++;
      }

      const newTopRenderedRowRelativeIndex = this.mod(
        topRenderedRowRelativeIndex +
          (topScroll ? -rowsToRecycle : rowsToRecycle)
      );

      if (useScrollingIndicator) this._debounceScrollState()

      this.setState({
        renderedRowIndex: newRenderedRowIndex,
        scrollState: newScrollState,
        topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
      });
    }
  };

  onScroll = (event: React.UIEvent<HTMLElement>) => {
    this.recycle(event.currentTarget.scrollTop);
  };

  scrollToDataIndex = (targetIndex: number) => {
    const targetRow = Object.values(this.rowToDataIndexMap).findIndex(
      (value) => targetIndex >= value[0] && targetIndex < value[1]
    );
    validateScrollTo(targetRow);
    const targetPosition = this.rowPositions[targetRow];

    if (this.listRef.current) this.listRef.current.scrollTop = targetPosition;
    this.recycle(targetPosition);
  };

  scrollToRow = (targetRow: number) => {
    const targetPosition = this.rowPositions[targetRow];
    validateScrollTo(targetPosition);
    if (this.listRef.current) this.listRef.current.scrollTop = targetPosition;
    this.recycle(targetPosition);
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
    const { renderedRowIndex, scrollState } = this.state;

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
        ref={this.listRef}
      >
        <ListTag
          className={classNames("react-recycled-list", listClassName)}
          style={{
            height: this.fullHeight,
            position: "relative",
          }}
        >
          {renderedRowIndex.map((absoluteRowIndex, index) => {
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
                  isScrolling={scrollState[index]}
                />
              </RowTag>
            );
          })}
        </ListTag>
      </div>
    );
  }
}