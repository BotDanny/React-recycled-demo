import React, { Component } from "react";
import * as _ from "lodash";
import {
  RowToDataIndexMap,
  calculateRowPositions,
  mapRowIndexToDataIndex,
  classNames,
  validateScrollTo,
} from "./utils";
import {
  OnRecycleCallBack,
  ReactRecycledListProps,
  ReactRecycledListState,
} from "./TypeDef";

interface props extends ReactRecycledListProps {
  rowHeights: number[];
}

abstract class General<
  P extends ReactRecycledListProps,
  S extends ReactRecycledListState
> extends React.Component<P, S> {
  abstract rowPositions: number[];
  abstract rowToDataIndexMap: RowToDataIndexMap;
  abstract totalNumOfRenderedRows: number;
  abstract listRef: React.RefObject<HTMLDivElement>;
  abstract recycle(scrollTop: number): void;
  abstract initialArrayTemplate: null[];
  abstract totalRows: number;
  abstract timeOut: any;

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

  mod = (n: number, m: number = this.totalNumOfRenderedRows) => {
    return ((n % m) + m) % m;
  };

  _debounceScrollState = () => {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.setState({
        scrollState: this.initialArrayTemplate.map(() => false),
      });
    }, this.props.scrollInterval || 250);
  };

  onListWillRecycle = (
    newRenderedRowIndex: number[],
    newTopRenderedRowRelativeIndex: number,
    newScrollState: boolean[]
  ) => {
    const { useScrollingIndicator, onRecycle } = this.props;
    if (useScrollingIndicator) {
      this.setState({
        scrollState: newScrollState,
      });
      this._debounceScrollState();
    }

    if (onRecycle) {
      const topRowIndex = newRenderedRowIndex[newTopRenderedRowRelativeIndex];
      const bottomRowIndex =
        newRenderedRowIndex[this.mod(newTopRenderedRowRelativeIndex - 1)];
      onRecycle({
        topRenderedRowIndex: topRowIndex,
        firstRenderedDataIndex: this.rowToDataIndexMap[topRowIndex][0],
        bottomRenderedRowIndex: bottomRowIndex,
        lastRenderedDataIndex: this.rowToDataIndexMap[bottomRowIndex][1] - 1,
      });
    }
  };
}

export default class VariableSizeList extends General<
  props,
  ReactRecycledListState
> {
  rowPositions: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  listRef: React.RefObject<HTMLDivElement>;
  prevScroll: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  timeOut: any;

  _debounceScrollState = () => {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.setState({
        scrollState: this.initialArrayTemplate.map(() => false),
      });
    }, this.props.scrollInterval || 250);
  };

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
    };
  };

  constructor(props: props) {
    super(props);

    this.listRef = React.createRef();
    this.prevScroll = 0;

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

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  onListWillRecycle = (
    newRenderedRowIndex: number[],
    newTopRenderedRowRelativeIndex: number,
    newScrollState: boolean[]
  ) => {
    const { useScrollingIndicator, onRecycle } = this.props;
    if (useScrollingIndicator) {
      this.setState({
        scrollState: newScrollState,
      });
      this._debounceScrollState();
    }

    if (onRecycle) {
      const topRowIndex = newRenderedRowIndex[newTopRenderedRowRelativeIndex];
      const bottomRowIndex =
        newRenderedRowIndex[this.mod(newTopRenderedRowRelativeIndex - 1)];
      onRecycle({
        topRenderedRowIndex: topRowIndex,
        firstRenderedDataIndex: this.rowToDataIndexMap[topRowIndex][0],
        bottomRenderedRowIndex: bottomRowIndex,
        lastRenderedDataIndex: this.rowToDataIndexMap[bottomRowIndex][1] - 1,
      });
    }
  };

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
        const newTopRenderedRowRelativeIndex = this.mod(rowsToRecycle);

        this.onListWillRecycle(
          newRenderedRowIndex,
          newTopRenderedRowRelativeIndex,
          newScrollState
        );
        this.setState({
          renderedRowIndex: newRenderedRowIndex,
          scrollState: newScrollState,
          topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
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
    const { height } = this.props;
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

      this.onListWillRecycle(
        newRenderedRowIndex,
        newTopRenderedRowRelativeIndex,
        newScrollState
      );

      this.setState({
        renderedRowIndex: newRenderedRowIndex,
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
            const startDataIndex = dataIndexInfo[0];
            const endDataIndex = dataIndexInfo[1];
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
                  dataIndex={startDataIndex}
                  dataEndIndex={endDataIndex}
                  row={absoluteRowIndex}
                  column={endDataIndex - startDataIndex}
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
