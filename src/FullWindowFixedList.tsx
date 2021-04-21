import { calculateRowPositions, mapRowIndexToDataIndex } from "./utils";
import { ReactRecycledListProps, ReactRecycledListState } from "./TypeDef";
import GeneralList from "./AbstractList";
import {
  RowToDataIndexMap,
  classNames,
  sortedFirstIndex,
  sortedLastIndex,
} from "./utils";
import { RowProps } from "./TypeDef";
import React from "react";

export interface FullWindowFixedListProps extends ReactRecycledListProps {
  rootMarginTop?: number;
  rootMarginBottom?: number;
  windowHeight?: number;
  serverWindowHeight?: number;
  scrollRef?: React.MutableRefObject<HTMLElement | undefined | null>;
}

export default class FullWindowFixedList<
  P extends FullWindowFixedListProps,
  S extends ReactRecycledListState
> extends GeneralList<P, S> {
  rowPositions: number[];
  rowHeights: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  windowHeight: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  timeOut: any;
  initialScrolling: boolean;
  fullListRef: React.RefObject<HTMLElement>;
  scrollListener: HTMLElement | (Window & typeof globalThis) | undefined;
  listWindowRef: any;

  initializeProperties: (constructor?: boolean) => any = (
    constructor: boolean = false
  ) => {
    const {
      rowHeight,
      column,
      rowColumns,
      data,
      additionalRenderedRow,
      serverWindowHeight,
      scrollRef,
      rootMarginTop = 0,
      rootMarginBottom = 0,
    } = this.props as P;

    // Validate

    if (rowColumns) {
      if (
        rowColumns.reduce((acc, current) => acc + current, 0) !== data.length
      ) {
        throw Error(
          "The total number of data item calculated from rowColumns does not match the length of your input data"
        );
      }
    } // no need to consider padding because when you scroll down padding doesn't apply

    let calculatedWindowHeight = 0;
    let scrollListener;

    if (constructor && serverWindowHeight !== undefined) {
      calculatedWindowHeight = serverWindowHeight;
    } else if ("scrollRef" in this.props) {
      if (scrollRef?.current) {
        calculatedWindowHeight = parseInt(
          window.getComputedStyle(scrollRef.current).height
        );
        scrollListener = scrollRef.current;
      } else calculatedWindowHeight = 0;
    } else {
      calculatedWindowHeight = window.innerHeight;
      scrollListener = window;
    }

    calculatedWindowHeight = Math.max(
      0,
      calculatedWindowHeight - rootMarginTop - rootMarginBottom
    );

    const calculatedRowColumns = rowColumns
      ? rowColumns
      : column
      ? Array(Math.ceil(data.length / column)).fill(column)
      : Array(data.length).fill(1);
    const rowHeights = calculatedRowColumns.map(() => rowHeight);

    const rowToDataIndexMap = mapRowIndexToDataIndex(
      calculatedRowColumns,
      data.length
    );
    const rowPositions = calculateRowPositions(rowHeights);
    const totalRows = rowHeights.length;

    const numOfVisibleRow = Math.ceil(calculatedWindowHeight / rowHeight);
    const numOfInvisibleRowOnEachDirection =
      additionalRenderedRow || numOfVisibleRow ? 1 : 0;
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
      rowHeights,
      windowHeight: calculatedWindowHeight,
      scrollListener,
    };
  };

  constructor(props: P) {
    super(props);

    const {
      rowToDataIndexMap,
      rowPositions,
      totalRows,
      initialArrayTemplate,
      fullHeight,
      totalNumOfRenderedRows,
      numOfInvisibleRowOnEachDirection,
      rowHeights,
      windowHeight,
      scrollListener,
    } = this.initializeProperties(true);

    this.fullListRef = React.createRef();
    this.listWindowRef = null;

    this.rowToDataIndexMap = rowToDataIndexMap;
    this.rowPositions = rowPositions;
    this.totalRows = totalRows;
    this.initialArrayTemplate = initialArrayTemplate;
    this.fullHeight = fullHeight;
    this.totalNumOfRenderedRows = totalNumOfRenderedRows;
    this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
    this.rowHeights = rowHeights;
    this.windowHeight = windowHeight;
    this.scrollListener = scrollListener;
    this.initialScrolling = false;

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    } as S;
  }

  componentDidMount() {
    this.attachScrollListener();
    const { initalScrollTop } = this.props;
    if (initalScrollTop) {
      this.manualScroll(initalScrollTop as number);
    }
  }

  componentWillUnmount() {
    if (this.scrollListener) {
      this.scrollListener.removeEventListener("scroll", this.onScroll);
    }
  }

  attachScrollListener = () => {
    if (this.scrollListener) {
      this.scrollListener.removeEventListener("scroll", this.onScroll);
      this.scrollListener.addEventListener("scroll", this.onScroll);
    }
  };

  getScrollTop = () => {
    const { rootMarginTop = 0 } = this.props;
    const recycledList = this.fullListRef.current as HTMLElement;
    if (!recycledList) return window.scrollY;
    const distanceBetweenScrollContainerAndWindow =
      this.scrollListener === window
        ? 0
        : (this.scrollListener as HTMLElement).getBoundingClientRect().top;

    return -(
      recycledList.getBoundingClientRect().top -
      distanceBetweenScrollContainerAndWindow -
      rootMarginTop
    );
  };

  onScroll = () => {
    if (this.fullListRef) {
      const scrollTop = this.getScrollTop();
      this.recycle(scrollTop);
    }
  };

  manualScroll = (targetPosition: number) => {
    const { rootMarginTop = 0 } = this.props;
    if (this.scrollListener) {
      const recycledList = this.fullListRef.current as HTMLElement;
      if (this.scrollListener === window) {
        const distanceToWindowTopFromTopOfList =
          recycledList.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top:
            distanceToWindowTopFromTopOfList + targetPosition - rootMarginTop,
        });
      } else {
        const customElement = this.scrollListener as HTMLElement;
        const distanceToElementTopFromTopOfList =
          recycledList.getBoundingClientRect().top -
          customElement.getBoundingClientRect().top;
        customElement.scrollTop =
          distanceToElementTopFromTopOfList + targetPosition - rootMarginTop;
      }
    }
  };

  shouldResetList = (prevProps: P) => {
    const {
      rowHeight,
      column,
      rowColumns,
      windowHeight,
      data,
      additionalRenderedRow,
      scrollRef,
      rootMarginBottom,
      rootMarginTop,
    } = this.props;

    return (
      prevProps.data !== data ||
      prevProps.windowHeight !== windowHeight ||
      (scrollRef && scrollRef.current !== this.scrollListener) ||
      prevProps.rowHeight !== rowHeight ||
      prevProps.column !== column ||
      prevProps.rowColumns !== rowColumns ||
      prevProps.additionalRenderedRow !== additionalRenderedRow ||
      prevProps.rootMarginBottom !== rootMarginBottom ||
      prevProps.rootMarginTop !== rootMarginTop
    );
  };

  resetProperties = () => {
    const {
      rowToDataIndexMap,
      rowPositions,
      totalRows,
      initialArrayTemplate,
      fullHeight,
      totalNumOfRenderedRows,
      numOfInvisibleRowOnEachDirection,
      rowHeights,
      windowHeight,
      scrollListener,
    } = this.initializeProperties();
    const { scrollRef } = this.props;

    this.rowToDataIndexMap = rowToDataIndexMap;
    this.rowPositions = rowPositions;
    this.totalRows = totalRows;
    this.initialArrayTemplate = initialArrayTemplate;
    this.fullHeight = fullHeight;
    this.totalNumOfRenderedRows = totalNumOfRenderedRows;
    this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
    this.rowHeights = rowHeights;
    this.windowHeight = windowHeight;
    if (scrollRef && scrollRef.current !== this.scrollListener) {
      this.scrollListener = scrollListener;
      this.attachScrollListener();
    }
  };

  componentDidUpdate(prevProps: P) {
    if (this.shouldResetList(prevProps)) {
      this.resetProperties();
      this.resetList();
    }
  }

  setCustomScrollRef = () => {
    this.resetProperties();
    this.resetList();
  };

  getTopViewportRowIndex = (scrollTop: number) => {
    return Math.max(Math.floor(scrollTop / this.props.rowHeight), 0);
  };

  getBottomViewportRowIndex = (viewportBottom: number) => {
    let viewportBottomRow = viewportBottom / this.props.rowHeight;
    if (Number.isInteger(viewportBottomRow)) viewportBottomRow -= 1;
    else viewportBottomRow = Math.floor(viewportBottomRow);
    return Math.min(viewportBottomRow, this.totalRows - 1);
  };

  getResetViewportBottom = () => {
    if (this.fullListRef) {
      const { rootMarginBottom = 0, rootMarginTop = 0 } = this.props;
      const scrollTop = this.getScrollTop();
      const fullWindowHeight =
        this.windowHeight + rootMarginTop + rootMarginBottom;
      return scrollTop + fullWindowHeight - rootMarginBottom;
    }
    return this.prevScroll + this.windowHeight;
  };

  render() {
    const {
      listTagName,
      listClassName,
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
      <ListTag
        className={classNames("react-recycled-list", listClassName)}
        style={{
          height: this.fullHeight,
          position: "relative",
          width,
        }}
        ref={this.fullListRef}
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
    );
  }
}