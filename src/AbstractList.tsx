import { withStyles } from "@material-ui/core";
import React from "react";
import {
  ReactRecycledListProps,
  ReactRecycledListState,
  RowProps,
} from "./TypeDef";
import { RowToDataIndexMap, validateScrollTo, classNames } from "./utils";

export default abstract class General<
  P extends ReactRecycledListProps,
  S extends ReactRecycledListState
> extends React.PureComponent<P, S> {
  prevScroll: number;
  prevBottomVisibleRow: number;
  abstract listWindowRef: any;
  abstract rowHeights: number[];
  abstract rowPositions: number[];
  abstract rowToDataIndexMap: RowToDataIndexMap;
  abstract totalNumOfRenderedRows: number;
  abstract initialArrayTemplate: null[];
  abstract totalRows: number;
  abstract fullHeight: number;
  abstract timeOut: any;
  abstract windowHeight: number;
  abstract numOfInvisibleRowOnEachDirection: number;
  abstract getTopViewportRowIndex(scrollTop: number): number;
  abstract getBottomViewportRowIndex(scrollTop: number): number;
  abstract shouldResetList(prevProps: P): boolean;
  abstract initializeProperties(): any;

  constructor(props: P) {
    super(props);
    this.prevScroll = 0;
    this.prevBottomVisibleRow = 0;
  }

  onScrollChange = (scrollTop: number) => {
    const { onVisibleRowChange } = this.props;
    if (!onVisibleRowChange) return;

    const bottomVisibleRowIndex = this.getBottomViewportRowIndex(
      scrollTop + this.windowHeight
    );

    if (bottomVisibleRowIndex === this.prevBottomVisibleRow) return;
    const topVisibleRowIndex = this.getTopViewportRowIndex(scrollTop);
    const firstVisibleDataIndex = this.rowToDataIndexMap[topVisibleRowIndex][0];

    const lastVisibleDataIndex =
      this.rowToDataIndexMap[bottomVisibleRowIndex][1] - 1;
    onVisibleRowChange({
      topVisibleRowIndex,
      firstVisibleDataIndex,
      bottomVisibleRowIndex,
      lastVisibleDataIndex,
    });
    this.prevBottomVisibleRow = bottomVisibleRowIndex;
  };

  recycle = (scrollTop: number) => {
    const {
      renderedRowIndex,
      topRenderedRowRelativeIndex,
      scrollState,
    } = this.state;
    const topScroll = scrollTop - this.prevScroll > 0 ? false : true;
    this.prevScroll = scrollTop;

    this.onScrollChange(scrollTop);

    let rowsToRecycle = 0;
    if (topScroll) {
      const topRenderedRowIndex = renderedRowIndex[topRenderedRowRelativeIndex];
      const newTopRenderedRowIndex = Math.max(
        this.getTopViewportRowIndex(scrollTop) -
          this.numOfInvisibleRowOnEachDirection,
        0
      );
      rowsToRecycle = topRenderedRowIndex - newTopRenderedRowIndex;
    } else {
      const bottomRenderedRowIndex =
        renderedRowIndex[this.mod(topRenderedRowRelativeIndex - 1)];
      const viewportBottom = scrollTop + this.windowHeight;
      const newBottomRenderedRowIndex = Math.min(
        this.getBottomViewportRowIndex(viewportBottom) +
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

  componentDidUpdate(prevProps: P) {
    if (this.shouldResetList(prevProps)) {
      const {
        rowToDataIndexMap,
        rowPositions,
        totalRows,
        initialArrayTemplate,
        fullHeight,
        totalNumOfRenderedRows,
        numOfInvisibleRowOnEachDirection,
        windowHeight,
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
      this.windowHeight = windowHeight;
      this.resetList();
    }
  }

  getResetViewportBottom = () => {
    return this.prevScroll + this.windowHeight;
  };

  resetList = () => {
    const bottomRenderedRowIndex = this.totalNumOfRenderedRows - 1;
    const viewportBottom = this.getResetViewportBottom();
    const newBottomRenderedRowIndex = Math.min(
      this.getBottomViewportRowIndex(viewportBottom) +
        this.numOfInvisibleRowOnEachDirection,
      this.totalRows - 1
    );

    const rowsToRecycle = newBottomRenderedRowIndex - bottomRenderedRowIndex;

    let newRenderedRowIndex = this.initialArrayTemplate.map(
      (_, index) => index
    );
    let newScrollState = this.initialArrayTemplate.map(() => false);
    let newTopRenderedRowRelativeIndex = 0;

    if (rowsToRecycle > 0) {
      let cycle = 0;
      while (cycle < rowsToRecycle) {
        const newTopRenderedRowRelativeIndex = this.mod(cycle);
        newRenderedRowIndex[
          newTopRenderedRowRelativeIndex
        ] += this.totalNumOfRenderedRows;
        newScrollState[newTopRenderedRowRelativeIndex] = true;
        cycle++;
      }
      newTopRenderedRowRelativeIndex = this.mod(rowsToRecycle);
    }

    this.onListWillRecycle(
      newRenderedRowIndex,
      newTopRenderedRowRelativeIndex,
      newScrollState
    );
    this.setState({
      renderedRowIndex: newRenderedRowIndex,
      topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
    });

    if (this.fullHeight - this.windowHeight < this.prevScroll) {
      this.prevScroll = this.fullHeight - this.windowHeight;
      this.prevBottomVisibleRow = this.totalRows - 1;
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
    this.manualScroll(targetPosition);
  };

  scrollToRow = (targetRow: number) => {
    const targetPosition = this.rowPositions[targetRow];
    validateScrollTo(targetPosition);
    this.manualScroll(targetPosition);
  };

  manualScroll = (targetPosition: number) => {
    if (this.listWindowRef.current) {
      this.listWindowRef.current.scrollTop = targetPosition;
      this.recycle(targetPosition);
    }
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
    const { useScrollingIndicator, onRenderedRowChange } = this.props;
    if (useScrollingIndicator) {
      this.setState({
        scrollState: newScrollState,
      });
      this._debounceScrollState();
    }

    if (onRenderedRowChange) {
      const topRowIndex = newRenderedRowIndex[newTopRenderedRowRelativeIndex];
      const bottomRowIndex =
        newRenderedRowIndex[this.mod(newTopRenderedRowRelativeIndex - 1)];
      onRenderedRowChange({
        topRenderedRowIndex: topRowIndex,
        firstRenderedDataIndex: this.rowToDataIndexMap[topRowIndex][0],
        bottomRenderedRowIndex: bottomRowIndex,
        lastRenderedDataIndex: this.rowToDataIndexMap[bottomRowIndex][1] - 1,
      });
    }
  };

  render() {
    const {
      listTagName,
      listClassName,
      listWindowClassName,
      data,
      width,
      rowComponent,
      rowTagName,
      rowClassName,
    } = this.props;
    const { renderedRowIndex, scrollState } = this.state;
    console.log("render");

    const ListTag: any = listTagName || "div";
    const RowTag: any = rowTagName || "div";
    const RowComponent: React.ElementType<RowProps> = rowComponent;
    return (
      <div
        className={classNames(
          "react-recycled-list-window",
          listWindowClassName
        )}
        style={{
          height: this.windowHeight,
          overflowY: "scroll",
          width,
        }}
        onScroll={this.onScroll}
        ref={this.listWindowRef}
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
                  height: this.rowHeights[absoluteRowIndex],
                  width: "100%",
                  boxSizing: "border-box",
                }}
                className={classNames("react-recycled-row", rowClassName)}
              >
                <RowComponent
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
