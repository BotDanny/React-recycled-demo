import { calculateRowPositions, mapRowIndexToDataIndex } from "./utils";
import {
  ReactRecycledFullWindowListProps,
  ReactRecycledListProps,
  ReactRecycledListState,
} from "./TypeDef";
import GeneralList from "./AbstractList";
import { RowToDataIndexMap, validateScrollTo, classNames } from "./utils";
import { RowProps } from "./TypeDef";
import React from "react";

interface FullWindowFixedListProps extends ReactRecycledListProps {
  rootMarginTop?: number;
  rootMarginBottom?: number;
  windowHeight?: number;
  serverWindowHeight?: number;
  scrollElement?: HTMLElement | undefined;
}

export default class FullWindowFixedList extends GeneralList<
  FullWindowFixedListProps,
  ReactRecycledListState
> {
  rowPositions: number[];
  rowHeights: number[];
  rowToDataIndexMap: RowToDataIndexMap;
  fullHeight: number;
  windowHeight: number;
  topWindowOffSet: number;
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  timeOut: any;
  fullListRef: React.RefObject<HTMLElement>;
  scrollListener: HTMLElement | (Window & typeof globalThis) | undefined;
  listWindowRef: any;

  initializeProperties = (constructor: boolean = false) => {
    const {
      rowHeight,
      column,
      rowColumns,
      data,
      additionalRenderedRow,
      serverWindowHeight,
      scrollElement,
      rootMarginTop = 0,
      rootMarginBottom = 0,
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
    } // no need to consider padding because when you scroll down padding doesn't apply

    let calculatedWindowHeight = 0;
    let topWindowOffSet = 0;
    let scrollListener;

    if (constructor && serverWindowHeight !== undefined) {
      calculatedWindowHeight = serverWindowHeight;
    } else if ("scrollElement" in this.props) {
      if (scrollElement !== undefined) {
        calculatedWindowHeight = parseInt(
          window.getComputedStyle(scrollElement).height
        );
        topWindowOffSet = scrollElement.getBoundingClientRect().top;
        scrollListener = scrollElement;
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
      topWindowOffSet,
      scrollListener,
    };
  };

  constructor(props: FullWindowFixedListProps) {
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
      topWindowOffSet,
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
    this.topWindowOffSet = topWindowOffSet;
    this.scrollListener = scrollListener;

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  componentDidMount() {
    this.attachScrollListener();
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

  onScroll = () => {
    const { rootMarginTop = 0 } = this.props;
    if (this.fullListRef) {
      const recycledList = this.fullListRef.current as HTMLElement;
      const scrollTop = -(
        recycledList.getBoundingClientRect().top -
        rootMarginTop -
        this.topWindowOffSet
      );
      this.recycle(scrollTop);
    }
  };

  manualScroll = (targetPosition: number) => {
    const { rootMarginTop = 0 } = this.props;
    if (this.scrollListener) {
      const recycledList = this.fullListRef.current as HTMLElement;
      if (this.scrollListener === window) {
        const distanceToWindowTop =
          recycledList.getBoundingClientRect().top + window.scrollY;
        this.scrollListener.scrollTo(
          0,
          distanceToWindowTop + targetPosition - rootMarginTop
        );
      } else {
        const customElement = this.scrollListener as HTMLElement;
        const distanceToElementTop =
          recycledList.getBoundingClientRect().top -
          customElement.getBoundingClientRect().top;

        customElement.scrollTop =
          distanceToElementTop + targetPosition - rootMarginTop;
      }
      this.recycle(targetPosition);
    }
  };

  componentDidUpdate(prevProps: FullWindowFixedListProps) {
    const {
      rowHeight,
      column,
      rowColumns,
      windowHeight,
      data,
      additionalRenderedRow,
      scrollElement,
      rootMarginBottom,
      rootMarginTop,
    } = this.props;
    if (
      prevProps.rowHeight !== rowHeight ||
      prevProps.column !== column ||
      prevProps.rowColumns !== rowColumns ||
      prevProps.windowHeight !== windowHeight ||
      prevProps.data !== data ||
      prevProps.additionalRenderedRow !== additionalRenderedRow ||
      prevProps.rootMarginBottom !== rootMarginBottom ||
      prevProps.rootMarginTop !== rootMarginTop
    ) {
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
        topWindowOffSet,
        scrollListener,
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
      this.topWindowOffSet = topWindowOffSet;
      this.scrollListener = scrollListener;
      this.resetList();
      if (prevProps.scrollElement !== scrollElement) {
        this.attachScrollListener();
      }
    }
  }

  getTopViewportRowIndex = (scrollTop: number) => {
    return Math.floor(scrollTop / this.props.rowHeight);
  };

  getBottomViewportRowIndex = (viewportBottom: number) => {
    let viewportBottomRow = viewportBottom / this.props.rowHeight;
    if (Number.isInteger(viewportBottomRow)) viewportBottomRow -= 1;
    else viewportBottomRow = Math.floor(viewportBottomRow);
    return viewportBottomRow;
  };

  getResetViewportBottom = () => {
    if (this.fullListRef) {
      const { rootMarginBottom = 0 } = this.props;
      const recycledList = this.fullListRef.current as HTMLElement;
      const scrollTop = -recycledList.getBoundingClientRect().top;
      return scrollTop + window.innerHeight - rootMarginBottom;
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
      scrollElement,
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
