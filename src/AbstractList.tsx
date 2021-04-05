import React from "react";
import { ReactRecycledListProps, ReactRecycledListState, RowProps } from "./TypeDef";
import { RowToDataIndexMap, validateScrollTo, classNames, } from "./utils";
import * as _ from "lodash";

export default abstract class General<
  P extends ReactRecycledListProps,
  S extends ReactRecycledListState
> extends React.PureComponent<P, S> {
  listRef: React.RefObject<HTMLDivElement>;
  prevScroll: number;
  abstract rowHeights: number[];
  abstract rowPositions: number[];
  abstract rowToDataIndexMap: RowToDataIndexMap;
  abstract totalNumOfRenderedRows: number;
  abstract initialArrayTemplate: null[];
  abstract totalRows: number;
  abstract fullHeight: number;
  abstract timeOut: any;
  abstract numOfInvisibleRowOnEachDirection: number;
  abstract getTopViewportRowIndex(scrollTop: number): number;
  abstract getBottomViewportRowIndex(scrollTop: number): number;

  constructor(props: P) {
    super(props);
    this.listRef = React.createRef();
    this.prevScroll = 0;
  }

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
        this.getTopViewportRowIndex(scrollTop) -
          this.numOfInvisibleRowOnEachDirection,
        0
      );
      rowsToRecycle = topRenderedRowIndex - newTopRenderedRowIndex;
    } else {
      const bottomRenderedRowIndex =
        renderedRowIndex[this.mod(topRenderedRowRelativeIndex - 1)];
      const viewportBottom = scrollTop + height;
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

  resetList = () => {
    const { height } = this.props;
    const bottomRenderedRowIndex = this.totalNumOfRenderedRows - 1;
    const viewportBottom = this.prevScroll + height;
    const newBottomRenderedRowIndex = Math.min(
        this.getBottomViewportRowIndex(viewportBottom) +
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
        topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
      });
    } else this.forceUpdate();

    if (this.fullHeight - height < this.prevScroll)
      this.prevScroll = this.fullHeight - height;
  };

  render() {
    const {
      listTagName,
      listClassName,
      listWindowClassName,
      data,
      height,
      width,
      rowComponent,
      rowTagName,
      rowClassName,
    } = this.props;
    const { renderedRowIndex, scrollState } = this.state;

    const ListTag: any = listTagName || "div";
    const RowTag: any = rowTagName || "div";
    const RowComponent: React.ElementType<RowProps> = rowComponent
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
