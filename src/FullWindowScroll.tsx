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
  scrollElement?: HTMLElement | null;
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
  initialArrayTemplate: null[];
  totalNumOfRenderedRows: number;
  numOfInvisibleRowOnEachDirection: number;
  totalRows: number;
  timeOut: any;
  fullListRef: React.RefObject<HTMLElement>;
  listWindowRef: any;

  initializeProperties = () => {
    const {
      rowHeight,
      column,
      rowColumns,
      data,
      additionalRenderedRow,
      windowHeight,
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
    }

    const calculatedWindowHeight =
      (serverWindowHeight || windowHeight || window.innerHeight) -
      rootMarginTop -
      rootMarginBottom;

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
      additionalRenderedRow || 1;
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
    this.fullListRef = React.createRef();
    this.listWindowRef = window;

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  componentDidMount() {
    if (window) {
      window.addEventListener("scroll", this.onWindowScroll);
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener("scroll", this.onWindowScroll);
    }
  }

  onWindowScroll = (event: Event) => {
    const { rootMarginTop = 0 } = this.props;
    if (this.fullListRef) {
      const targetElement = this.fullListRef.current as HTMLElement;
      const scrollTop = -(
        targetElement.getBoundingClientRect().top - rootMarginTop
      );
      if (scrollTop >= 0) this.recycle(scrollTop);
    }
  };

  componentDidUpdate(prevProps: FullWindowFixedListProps) {
    const currentProp = this.props;
    if (prevProps === currentProp) return;
    const {
      rowHeight,
      column,
      rowColumns,
      windowHeight,
      data,
      additionalRenderedRow,
    } = currentProp;
    if (
      prevProps.rowHeight !== rowHeight ||
      prevProps.column !== column ||
      prevProps.rowColumns !== rowColumns ||
      prevProps.windowHeight !== windowHeight ||
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
        rowHeights,
        windowHeight,
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

  getTopViewportRowIndex = (scrollTop: number) => {
    return Math.floor(scrollTop / this.props.rowHeight);
  };

  getBottomViewportRowIndex = (viewportBottom: number) => {
    let viewportBottomRow = viewportBottom / this.props.rowHeight;
    if (Number.isInteger(viewportBottomRow)) viewportBottomRow -= 1;
    else viewportBottomRow = Math.floor(viewportBottomRow);
    return viewportBottomRow;
  };

  getViewportBottomPosition = (scrollTop: number) => {
    const { rootMarginBottom = 0 } = this.props;
    return this.windowHeight - rootMarginBottom - scrollTop;
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
      scrollElement
    } = this.props;
    if (!scrollElement) return null as any
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
