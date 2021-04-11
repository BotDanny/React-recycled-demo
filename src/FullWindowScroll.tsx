import { calculateRowPositions, mapRowIndexToDataIndex } from "./utils";
import { ReactRecycledFullWindowListProps, ReactRecycledListProps, ReactRecycledListState } from "./TypeDef";
import GeneralList from "./AbstractList";
import { RowToDataIndexMap, validateScrollTo, classNames } from "./utils";
import { RowProps } from "./TypeDef";
import React from "react";
export default class FullWindowScroll extends GeneralList<
  ReactRecycledListProps,
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
  fullListRef: React.RefObject<HTMLElement>;

  initializeProperties = () => {
    const {
      rowHeight,
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
    }

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
      rowHeights,
    };
  };

  constructor(props: ReactRecycledListProps) {
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
    } = this.initializeProperties();

    this.rowToDataIndexMap = rowToDataIndexMap;
    this.rowPositions = rowPositions;
    this.totalRows = totalRows;
    this.initialArrayTemplate = initialArrayTemplate;
    this.fullHeight = fullHeight;
    this.totalNumOfRenderedRows = totalNumOfRenderedRows;
    this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
    this.rowHeights = rowHeights;
    this.fullListRef = React.createRef();

    this.state = {
      renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
      scrollState: this.initialArrayTemplate.map(() => false),
      topRenderedRowRelativeIndex: 0,
    };
  }

  componentDidUpdate(prevProps: ReactRecycledListProps) {
    const currentProp = this.props;
    if (prevProps === currentProp) return;
    const {
      rowHeight,
      column,
      rowColumns,
      height,
      data,
      additionalRenderedRow,
    } = currentProp;
    if (
      prevProps.rowHeight !== rowHeight ||
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
        rowHeights,
      } = this.initializeProperties();

      this.rowToDataIndexMap = rowToDataIndexMap;
      this.rowPositions = rowPositions;
      this.totalRows = totalRows;
      this.initialArrayTemplate = initialArrayTemplate;
      this.fullHeight = fullHeight;
      this.totalNumOfRenderedRows = totalNumOfRenderedRows;
      this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
      this.rowHeights = rowHeights;

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

// export class FullWindow extends React.PureComponent<
//   ReactRecycledFullWindowListProps,
//   ReactRecycledListState
// > {
//   listRef: React.RefObject<HTMLDivElement>;
//   prevScroll: number;
//   prevBottomVisibleRow: number;
//   rowHeights: number[];
//   rowPositions: number[];
//   rowToDataIndexMap: RowToDataIndexMap;
//   totalNumOfRenderedRows: number;
//   initialArrayTemplate: null[];
//   totalRows: number;
//   fullHeight: number;
//   timeOut: any;
//   numOfInvisibleRowOnEachDirection: number;
//   fullListRef: React.RefObject<HTMLElement>;

//   initializeProperties = () => {
//     const {
//       rowHeight,
//       column,
//       rowColumns,
//       data,
//       additionalRenderedRow,
//     } = this.props;

//     // Validate

//     if (rowColumns) {
//       if (
//         rowColumns.reduce((acc, current) => acc + current, 0) !== data.length
//       ) {
//         throw Error(
//           "The total number of data item calculated from rowColumns does not match the length of your input data"
//         );
//       }
//     }

//     const calculatedRowColumns = rowColumns
//       ? rowColumns
//       : column
//       ? Array(Math.ceil(data.length / column)).fill(column)
//       : Array(data.length).fill(1);
//     const rowHeights = calculatedRowColumns.map(() => rowHeight);

//     const rowToDataIndexMap = mapRowIndexToDataIndex(
//       calculatedRowColumns,
//       data.length
//     );
//     const rowPositions = calculateRowPositions(rowHeights);
//     const totalRows = rowHeights.length;

//     const numOfVisibleRow = Math.ceil(height / rowHeight);
//     const numOfInvisibleRowOnEachDirection =
//       additionalRenderedRow || Math.ceil(numOfVisibleRow / 2);
//     let totalNumOfRenderedRows =
//       numOfVisibleRow + numOfInvisibleRowOnEachDirection * 2;
//     if (totalNumOfRenderedRows > totalRows) totalNumOfRenderedRows = totalRows;
//     const initialArrayTemplate = Array(totalNumOfRenderedRows).fill(null);

//     const fullHeight = rowHeights.reduce((acc, current) => acc + current, 0);

//     return {
//       rowToDataIndexMap,
//       rowPositions,
//       totalRows,
//       initialArrayTemplate,
//       fullHeight,
//       totalNumOfRenderedRows,
//       numOfInvisibleRowOnEachDirection,
//       rowHeights,
//     };
//   };

//   getTopViewportRowIndex = (scrollTop: number) => {
//     return Math.floor(scrollTop / this.props.rowHeight);
//   };

//   getBottomViewportRowIndex = (viewportBottom: number) => {
//     let viewportBottomRow = viewportBottom / this.props.rowHeight;
//     if (Number.isInteger(viewportBottomRow)) viewportBottomRow -= 1;
//     else viewportBottomRow = Math.floor(viewportBottomRow);
//     return viewportBottomRow;
//   };


//   constructor(props: ReactRecycledListProps) {
//     super(props);
//     this.listRef = React.createRef();
//     this.prevScroll = 0;
//     this.prevBottomVisibleRow = 0;
//     const {
//         rowToDataIndexMap,
//         rowPositions,
//         totalRows,
//         initialArrayTemplate,
//         fullHeight,
//         totalNumOfRenderedRows,
//         numOfInvisibleRowOnEachDirection,
//         rowHeights,
//       } = this.initializeProperties();
  
//       this.rowToDataIndexMap = rowToDataIndexMap;
//       this.rowPositions = rowPositions;
//       this.totalRows = totalRows;
//       this.initialArrayTemplate = initialArrayTemplate;
//       this.fullHeight = fullHeight;
//       this.totalNumOfRenderedRows = totalNumOfRenderedRows;
//       this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
//       this.rowHeights = rowHeights;
//       this.fullListRef = React.createRef();
  
//       this.state = {
//         renderedRowIndex: this.initialArrayTemplate.map((_, index) => index),
//         scrollState: this.initialArrayTemplate.map(() => false),
//         topRenderedRowRelativeIndex: 0,
//       };
//   }

//   componentDidUpdate(prevProps: ReactRecycledListProps) {
//     const currentProp = this.props;
//     if (prevProps === currentProp) return;
//     const {
//       rowHeight,
//       column,
//       rowColumns,
//       data,
//       additionalRenderedRow,
//     } = currentProp;
//     if (
//       prevProps.rowHeight !== rowHeight ||
//       prevProps.column !== column ||
//       prevProps.rowColumns !== rowColumns ||
//       prevProps.data !== data ||
//       prevProps.additionalRenderedRow !== additionalRenderedRow
//     ) {
//       const {
//         rowToDataIndexMap,
//         rowPositions,
//         totalRows,
//         initialArrayTemplate,
//         fullHeight,
//         totalNumOfRenderedRows,
//         numOfInvisibleRowOnEachDirection,
//         rowHeights,
//       } = this.initializeProperties();

//       this.rowToDataIndexMap = rowToDataIndexMap;
//       this.rowPositions = rowPositions;
//       this.totalRows = totalRows;
//       this.initialArrayTemplate = initialArrayTemplate;
//       this.fullHeight = fullHeight;
//       this.totalNumOfRenderedRows = totalNumOfRenderedRows;
//       this.numOfInvisibleRowOnEachDirection = numOfInvisibleRowOnEachDirection;
//       this.rowHeights = rowHeights;

//       this.resetList();
//     }
//   }

//   onScrollChange = (scrollTop: number) => {
//     const { onVisibleRowChange } = this.props;
//     if (!onVisibleRowChange) return;

//     const bottomVisibleRowIndex = this.getBottomViewportRowIndex(
//       scrollTop + this.props.height
//     );

//     if (bottomVisibleRowIndex === this.prevBottomVisibleRow) return;
//     const topVisibleRowIndex = this.getTopViewportRowIndex(scrollTop);
//     const firstVisibleDataIndex = this.rowToDataIndexMap[topVisibleRowIndex][0];

//     const lastVisibleDataIndex =
//       this.rowToDataIndexMap[bottomVisibleRowIndex][1] - 1;
//     onVisibleRowChange({
//       topVisibleRowIndex,
//       firstVisibleDataIndex,
//       bottomVisibleRowIndex,
//       lastVisibleDataIndex,
//     });
//     this.prevBottomVisibleRow = bottomVisibleRowIndex;
//   };

//   recycle = (scrollTop: number) => {
//     const { height } = this.props;
//     const {
//       renderedRowIndex,
//       topRenderedRowRelativeIndex,
//       scrollState,
//     } = this.state;
//     const topScroll = scrollTop - this.prevScroll > 0 ? false : true;
//     this.prevScroll = scrollTop;

//     this.onScrollChange(scrollTop);

//     let rowsToRecycle = 0;
//     if (topScroll) {
//       const topRenderedRowIndex = renderedRowIndex[topRenderedRowRelativeIndex];
//       const newTopRenderedRowIndex = Math.max(
//         this.getTopViewportRowIndex(scrollTop) -
//           this.numOfInvisibleRowOnEachDirection,
//         0
//       );
//       rowsToRecycle = topRenderedRowIndex - newTopRenderedRowIndex;
//     } else {
//       const bottomRenderedRowIndex =
//         renderedRowIndex[this.mod(topRenderedRowRelativeIndex - 1)];
//       const viewportBottom = scrollTop + height;
//       const newBottomRenderedRowIndex = Math.min(
//         this.getBottomViewportRowIndex(viewportBottom) +
//           this.numOfInvisibleRowOnEachDirection,
//         this.totalRows - 1
//       );

//       rowsToRecycle = newBottomRenderedRowIndex - bottomRenderedRowIndex;
//     }

//     if (rowsToRecycle > 0) {
//       const newRenderedRowIndex = [...renderedRowIndex];
//       const newScrollState = [...scrollState];
//       let cycle = 0;
//       while (cycle < rowsToRecycle) {
//         const newTopRenderedRowRelativeIndex = this.mod(
//           topRenderedRowRelativeIndex + (topScroll ? -cycle - 1 : cycle)
//         );

//         newRenderedRowIndex[newTopRenderedRowRelativeIndex] += topScroll
//           ? -this.totalNumOfRenderedRows
//           : this.totalNumOfRenderedRows;

//         newScrollState[newTopRenderedRowRelativeIndex] = true;

//         cycle++;
//       }

//       const newTopRenderedRowRelativeIndex = this.mod(
//         topRenderedRowRelativeIndex +
//           (topScroll ? -rowsToRecycle : rowsToRecycle)
//       );

//       this.onListWillRecycle(
//         newRenderedRowIndex,
//         newTopRenderedRowRelativeIndex,
//         newScrollState
//       );

//       this.setState({
//         renderedRowIndex: newRenderedRowIndex,
//         topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
//       });
//     }
//   };

//   resetList = () => {
//     const bottomRenderedRowIndex = this.totalNumOfRenderedRows - 1;
//     const viewportBottom = this.prevScroll + height;
//     const newBottomRenderedRowIndex = Math.min(
//       this.getBottomViewportRowIndex(viewportBottom) +
//         this.numOfInvisibleRowOnEachDirection,
//       this.totalRows - 1
//     );

//     const rowsToRecycle = newBottomRenderedRowIndex - bottomRenderedRowIndex;

//     if (rowsToRecycle > 0) {
//       const newRenderedRowIndex = this.initialArrayTemplate.map(
//         (_, index) => index
//       );
//       const newScrollState = this.initialArrayTemplate.map(() => false);
//       let cycle = 0;
//       while (cycle < rowsToRecycle) {
//         const newTopRenderedRowRelativeIndex = this.mod(cycle);
//         newRenderedRowIndex[
//           newTopRenderedRowRelativeIndex
//         ] += this.totalNumOfRenderedRows;
//         newScrollState[newTopRenderedRowRelativeIndex] = true;
//         cycle++;
//       }
//       const newTopRenderedRowRelativeIndex = this.mod(rowsToRecycle);

//       this.onListWillRecycle(
//         newRenderedRowIndex,
//         newTopRenderedRowRelativeIndex,
//         newScrollState
//       );
//       this.setState({
//         renderedRowIndex: newRenderedRowIndex,
//         topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
//       });
//     } else {
//       const newRenderedRowIndex = this.initialArrayTemplate.map(
//         (_, index) => index
//       );
//       const newScrollState = this.initialArrayTemplate.map(() => false);
//       const newTopRenderedRowRelativeIndex = 0;

//       this.onListWillRecycle(
//         newRenderedRowIndex,
//         newTopRenderedRowRelativeIndex,
//         newScrollState
//       );
//       this.setState({
//         renderedRowIndex: newRenderedRowIndex,
//         topRenderedRowRelativeIndex: newTopRenderedRowRelativeIndex,
//       });
//     }

//     if (this.fullHeight - height < this.prevScroll) {
//       this.prevScroll = this.fullHeight - height;
//       this.prevBottomVisibleRow = this.totalRows - 1;
//     }
//   };

//   onScroll = (event: React.UIEvent<HTMLElement>) => {
//     this.recycle(event.currentTarget.scrollTop);
//   };

//   scrollToDataIndex = (targetIndex: number) => {
//     const targetRow = Object.values(this.rowToDataIndexMap).findIndex(
//       (value) => targetIndex >= value[0] && targetIndex < value[1]
//     );
//     validateScrollTo(targetRow);
//     const targetPosition = this.rowPositions[targetRow];

//     if (this.listRef.current) this.listRef.current.scrollTop = targetPosition;
//     this.recycle(targetPosition);
//   };

//   scrollToRow = (targetRow: number) => {
//     const targetPosition = this.rowPositions[targetRow];
//     validateScrollTo(targetPosition);
//     if (this.listRef.current) this.listRef.current.scrollTop = targetPosition;
//     this.recycle(targetPosition);
//   };

//   mod = (n: number, m: number = this.totalNumOfRenderedRows) => {
//     return ((n % m) + m) % m;
//   };

//   _debounceScrollState = () => {
//     clearTimeout(this.timeOut);
//     this.timeOut = setTimeout(() => {
//       this.setState({
//         scrollState: this.initialArrayTemplate.map(() => false),
//       });
//     }, this.props.scrollInterval || 250);
//   };

//   onListWillRecycle = (
//     newRenderedRowIndex: number[],
//     newTopRenderedRowRelativeIndex: number,
//     newScrollState: boolean[]
//   ) => {
//     const { useScrollingIndicator, onRenderedRowChange } = this.props;
//     if (useScrollingIndicator) {
//       this.setState({
//         scrollState: newScrollState,
//       });
//       this._debounceScrollState();
//     }

//     if (onRenderedRowChange) {
//       const topRowIndex = newRenderedRowIndex[newTopRenderedRowRelativeIndex];
//       const bottomRowIndex =
//         newRenderedRowIndex[this.mod(newTopRenderedRowRelativeIndex - 1)];
//       onRenderedRowChange({
//         topRenderedRowIndex: topRowIndex,
//         firstRenderedDataIndex: this.rowToDataIndexMap[topRowIndex][0],
//         bottomRenderedRowIndex: bottomRowIndex,
//         lastRenderedDataIndex: this.rowToDataIndexMap[bottomRowIndex][1] - 1,
//       });
//     }
//   };

//   render() {
//     const {
//       listTagName,
//       listClassName,
//       listWindowClassName,
//       data,
//       width,
//       rowComponent,
//       rowTagName,
//       rowClassName,
//     } = this.props;
//     const { renderedRowIndex, scrollState } = this.state;
//     console.log("render");

//     const ListTag: any = listTagName || "div";
//     const RowTag: any = rowTagName || "div";
//     const RowComponent: React.ElementType<RowProps> = rowComponent;
//     return (
//       <div
//         className={classNames(
//           "react-recycled-list-window",
//           listWindowClassName
//         )}
//         style={{
//           height,
//           width,
//           overflowY: "scroll",
//         }}
//         onScroll={this.onScroll}
//         ref={this.listRef}
//       >
//         <ListTag
//           className={classNames("react-recycled-list", listClassName)}
//           style={{
//             height: this.fullHeight,
//             position: "relative",
//           }}
//         >
//           {renderedRowIndex.map((absoluteRowIndex, index) => {
//             const dataIndexInfo = this.rowToDataIndexMap[absoluteRowIndex];
//             const startDataIndex = dataIndexInfo[0];
//             const endDataIndex = dataIndexInfo[1];
//             return (
//               <RowTag
//                 style={{
//                   position: "absolute",
//                   top: this.rowPositions[absoluteRowIndex],
//                   height: this.rowHeights[absoluteRowIndex],
//                   width: "100%",
//                   boxSizing: "border-box",
//                 }}
//                 className={classNames("react-recycled-row", rowClassName)}
//               >
//                 <RowComponent
//                   data={data}
//                   dataIndex={startDataIndex}
//                   dataEndIndex={endDataIndex}
//                   row={absoluteRowIndex}
//                   column={endDataIndex - startDataIndex}
//                   isScrolling={scrollState[index]}
//                 />
//               </RowTag>
//             );
//           })}
//         </ListTag>
//       </div>
//     );
//   }
// }
