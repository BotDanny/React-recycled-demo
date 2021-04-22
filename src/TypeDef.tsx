interface inLineStyle {
  position: string;
  top: number;
  height: number;
}
export interface RowProps {
  data: any[];
  row: number;
  dataIndex: number;
  dataEndIndex: number;
  column: number;
  isScrolling: boolean;
  style: React.CSSProperties;
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
  onRenderedRowChange?: onRenderedRowChangeCallBack;
  onVisibleRowChange?: onVisibleRowChangeCallBack;
}

export interface RenderInfo {
  firstRenderedRowIndex: number;
  firstRenderedDataIndex: number;
  lastRenderedRowIndex: number;
  lastRenderedDataIndex: number;
  lastRowIndex: number;
}

export interface VisibilityInfo {
  firstVisibleRowIndex: number;
  firstVisibleDataIndex: number;
  lastVisibleRowIndex: number;
  lastVisibleDataIndex: number;
  lastRowIndex: number;
}

export type onRenderedRowChangeCallBack = (renderInfo: RenderInfo) => void;

export type onVisibleRowChangeCallBack = (renderInfo: VisibilityInfo) => void;

export interface ReactRecycledListState {
  renderedRowIndex: number[];
  topRenderedRowRelativeIndex: number;
  scrollState: boolean[];
}

export const noRowRenderInfo: RenderInfo = {
  firstRenderedRowIndex: -1,
  firstRenderedDataIndex: -1,
  lastRenderedRowIndex: -1,
  lastRenderedDataIndex: -1,
  lastRowIndex: -1,
}

export const noRowVisibilityInfo: VisibilityInfo = {
  firstVisibleRowIndex: -1,
  firstVisibleDataIndex: -1,
  lastVisibleRowIndex: -1,
  lastVisibleDataIndex: -1,
  lastRowIndex: -1,
}