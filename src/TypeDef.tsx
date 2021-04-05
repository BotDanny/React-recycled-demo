export interface RowProps {
  data: any[];
  row: number;
  dataIndex: number;
  dataEndIndex: number;
  column: number;
  isScrolling: boolean;
}

export interface ReactRecycledListProps {
  height: number;
  width: string;
  data: any[];
  rowHeight: number;
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
  onRenderedRowChange?: OnRecycleCallBack;
  onVisibleRowChange?: OnScrollCallBack;
}

export type OnRecycleCallBack = (renderInfo: {
  topRenderedRowIndex: number;
  firstRenderedDataIndex: number;
  bottomRenderedRowIndex: number;
  lastRenderedDataIndex: number;
}) => void;

export type OnScrollCallBack = (renderInfo: {
  topVisibleRowIndex: number;
  firstVisibleDataIndex: number;
  bottomVisibleRowIndex: number;
  lastVisibleDataIndex: number;
}) => void;

export interface ReactRecycledListState {
  renderedRowIndex: number[];
  topRenderedRowRelativeIndex: number;
  scrollState: boolean[];
}
