export interface RowProps {
  data: any[];
  row: number;
  dataIndex: number;
  dataEndIndex: number;
  column: number;
  isScrolling: boolean;
}

export interface ReactRecycledListProps {
  width?: string | number;
  data: any[];
  rowHeight: number;
  rowComponent: React.ElementType<RowProps>;
  initalScrollTop?: number;
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
  firstRenderedRowIndex: number;
  firstRenderedDataIndex: number;
  lastRenderedRowIndex: number;
  lastRenderedDataIndex: number;
  lastRowIndex: number;
}) => void;

export type OnScrollCallBack = (renderInfo: {
  firstVisibleRowIndex: number;
  firstVisibleDataIndex: number;
  lastVisibleRowIndex: number;
  lastVisibleDataIndex: number;
  lastRowIndex: number;
}) => void;

export interface ReactRecycledListState {
  renderedRowIndex: number[];
  topRenderedRowRelativeIndex: number;
  scrollState: boolean[];
}