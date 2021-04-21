import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import { Button } from "@material-ui/core";

export default function DynamicLoading() {
  return <GeneralPage code={code} Demo={DynamicLoadingDemo} />;
}

const numberOfItemPerPage = 10;
function fetchData(page: number, onSuccess: any) {
  setTimeout(() => {
    const data = [];
    const startDataIndex = (page - 1) * numberOfItemPerPage;
    for (
      let i = startDataIndex;
      i < startDataIndex + numberOfItemPerPage;
      i++
    ) {
      data.push(`item ${i + 1}`);
    }
    onSuccess(data, page);
  }, 1500);
}

type PageData = {
  [key: string]: {
    isLoading: boolean;
    hasLoaded: boolean;
    data: any[];
  };
};

function populateInitialPage() {
  const page: PageData = {};
  for (let i = 1; i <= 10; i++) {
    page[i] = {
      isLoading: false,
      hasLoaded: false,
      data: Array(numberOfItemPerPage)
        .fill(null)
        .map(() => undefined),
    };
  }
  return page;
}

function getPageFromDataIndex(index: number) {
    return Math.floor(index / numberOfItemPerPage) + 1
}
const initialPagedData = populateInitialPage();

function DynamicLoadingDemo() {
  const [pagedData, setPagedData] = React.useState(initialPagedData);

  const onFetchDataSuccess = (newData: any[], page: number) => {
    const newPagedData: PageData = {
      ...pagedData,
      [page]: {
        data: newData,
        hasLoaded: true,
      },
    };
    setPagedData(newPagedData);
  };

  const dataList = Object.values(pagedData)
    .map(({ data }) => data)
    .flat();

  const onRenderedRowChange = (renderInfo: {
    firstRenderedRowIndex: number;
    firstRenderedDataIndex: number;
    lastRenderedRowIndex: number;
    lastRenderedDataIndex: number;
    lastRowIndex: number;
  }) => {
    const {
      firstRenderedRowIndex,
      firstRenderedDataIndex,
      lastRenderedRowIndex,
      lastRowIndex,
      lastRenderedDataIndex,
    } = renderInfo;
    const firstRenderedDataPage = getPageFromDataIndex(firstRenderedDataIndex);
    if (!pagedData[firstRenderedDataPage].hasLoaded && !pagedData[firstRenderedDataPage].isLoading) {
        setPagedData({...pagedData, [firstRenderedDataPage]: {isLoading: true}})
        fetchData(firstRenderedDataPage, onFetchDataSuccess)
    }
    const lastRenderedDataPage = getPageFromDataIndex(lastRenderedDataIndex);
    if (!pagedData[lastRenderedDataPage].hasLoaded && !pagedData[lastRenderedDataPage].isLoading) {
        setPagedData({...pagedData, [lastRenderedDataIndex]: {isLoading: true}})
        fetchData(lastRenderedDataPage, onFetchDataSuccess)
    }
  };
  return (
    <FixedList
      height={500}
      rowComponent={Row}
      data={dataList}
      rowHeight={100}
      onRenderedRowChange={onRenderedRowChange}
    />
  );
}

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex } = props;
  const value = data[dataIndex];
  const displayValue = value === undefined ? "loading" : value;
  return <div key={dataIndex}>{displayValue}</div>;
});

const code = `import { FixedList } from "react-recycled-list";

// This is a rather complicated example
// The key point is to utilize onRenderedRowChange or onVisibleRowChange to load your data

const numberOfItemPerPage = 20;

// Just a simulation of an API call
function fetchData(page, onSuccess) {
  setTimeout(() => {
    const data = [];
    const startDataIndex = (page - 1) * numberOfItemPerPage;
    const endDataIndex = startDataIndex + numberOfItemPerPage
    for (let i = startDataIndex; i < endDataIndex; i++) {
      data.push(\`item \${i + 1}\`);
    }
    onSuccess(data, page);
  }, 2000);
}

// Use a map to store the data (you do not have to do the same, the implementation is up to you)
const initialStore = {
  data: { 1: Array(numberOfItemPerPage).fill(null).map(() => undefined) },
  nextPage: 0,
  isLoading: false,
};

function DynamicLoadingDemo() {
  const [store, setStore] = React.useState(initialStore);

  const onFetchDataSuccess = (newData, page) => {
    const newStoreData = { ...store.data, [page]: newData };
    // For demo purpose I set the max page to be 5
    const nextPage = page + 1
    const hasNextPage = nextPage <= 5;
    if (hasNextPage) {
      newStoreData[nextPage] = [undefined];
    }
    setStore({ ...store, data: newStoreData, isLoading: false, nextPage: nextPage });
  };

  React.useEffect(() => {
    // Initial fetch
    fetchData(store.nextPage, onFetchDataSuccess)
  }, [])

  const onRenderedRowChange = (renderInfo) => {
    const {
      firstRenderedRowIndex,
      firstRenderedDataIndex,
      lastRenderedRowIndex,
      lastRenderedDataIndex,
      lastRowIndex,
    } = renderInfo;
    // If the last row is rendered (NOT visible yet!) and we are not already loading data, we fetch new data
    // If you want to fetch data when the last row is visible then use onVisibleRowChange
    if (lastRenderedRowIndex === lastRowIndex) {
      if (store.isLoading === false) {
        setStore({ ...store, isLoading: true });
        fetchData(store.nextPage, onFetchDataSuccess)
      }
    }
  };

  const listData = Object.values(store.data).flat();

  return (
    <FixedList
              height={500}
              rowComponent={Row}
              data={listData}
              rowHeight={100}
              onRenderedRowChange={onRenderedRowChange}
        />
  );
}
const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex } = props;
  const value = data[dataIndex];
  const displayValue = value === undefined ? "loading" : value;
  return <div key={dataIndex}>{displayValue}</div>;
})`;
