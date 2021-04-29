import { AppBar, Box, Divider, Tab, Tabs, Typography } from "@material-ui/core";
import { TabPanel } from "./Performance";
import React from "react";
import Highlight from "react-highlight.js";
import listPropsImg from "./listProps.png";
import { Link } from "react-router-dom";

export default function ResponsiveWindowContainerDoc() {
  return (
    <div className="why-page">
      <Box p={1} pl={5} pr={5}>
        <Highlight language="js">{code1}</Highlight>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          render:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            {"({height: number, width: number}): any"}
          </span>
          , <span className="required">required*</span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          A function that renders the list based on the given height and width.
          If a custom window is used, then the height and width passed into this
          function will be the height and width of the element that the
          scrollRef points to. Otherwise, it would be the height and width of
          the global window object. See{" "}
          <Link to="./custom-window">default window example</Link> or{" "}
          <Link to="./custom-window">custom window example</Link> for more
          detail.
        </Typography>
      </Box>
      <Box pb={3} pt={0} pl={5} pr={5}>
        <Highlight language="js">{dataCode}</Highlight>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          scrollRef:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            React ref object
          </span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          The element that you use to attach the scroll listener. This is
          usefull when you want to use a custom window list/grid. See <Link to=""></Link>
        </Typography>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          debounceResize:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            boolean, default = false
          </span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          If set true the list will adjust its height and width only when the
          user stops resizing.
        </Typography>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          debounceInterval:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            number
          </span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          How many milisecond to wait after the the user stops resizing to
          triger the resizing (re-computation) of the list.
        </Typography>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          debounceInterval:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            number
          </span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          How many milisecond to wait after the the user stops resizing to
          triger the resizing (re-computation) of the list.
        </Typography>
      </Box>
      <Divider className="divider" />
      <Box pl={5} pr={5}>
        <Typography variant="h6" style={{ fontWeight: 500 }}>
          serverSideHeight:{" "}
          <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
            number
          </span>
        </Typography>
      </Box>
      <Box pb={2} pt={2} pl={5} pr={5}>
        <Typography variant="body1">
          The initial rendered height of the list. This will determine how many
          rows are rendered on the server side. Once the page loads the height
          will be adjusted to the height of its the global window object or the
          element that scrollRef points to (if set).
        </Typography>
      </Box>
      <Divider className="divider" />
    </div>
  );
}

const code1 = `import { ResponsiveWindowContainer } from "react-recycled-list;`;

const dataCode = `const renderList = (sizeInfo) => {
    const { width, height } = sizeInfo;
    const column = width > 1200 ? 2 : 1;
    return (
      <FullWindowFixedList
                      windowHeight={height}
                      rowComponent={Row}
                      data={data}
                      rowHeight={100}
                      column={column}
              />
    );
};`;

const rowCode = `const MyRow = React.memo(function (props) {
    // This is a grid row that has 4 data items in it
    const { data, dataIndex: dataStartIndex, dataEndIndex, top, height, row, column } = props;
    const rowData = data.slice(dataStartIndex, dataEndIndex);
    const columnStyle = { width: "25%", textAlign: "center" };
    return (
        <div style={{top, height}} className="react-recycled-row">
                            {rowData.map((item) => <div style={columnStyle} key={item}>{item}</div>)}
                 </div>
    )
});`;

const rowColumnsCode = `function MyList() {
    //...
    const data = ["item 1", "item 2", "item 3", "item 4", "item 5", "item 6",];
    // Total of 3 rows. First row has 1 column, second row has 2 columns and thrid row has 1 column
    // total number of data items = 3 + 1 + 2 = 6 = length of data
    const rowColumns = [3,1,2];
    return <FixedList data={data} rowColumns={rowColumns} .../>
}`;

const onRenderedRowChangeCode = `function LazyLoadingDemo() {
    // ....
    const onRenderedRowChange = (renderInfo) => {
        const {
            firstRenderedRowIndex,
            firstRenderedDataIndex,
            lastRenderedRowIndex,
            lastRenderedDataIndex,
            lastRowIndex,
        } = renderInfo;
        // If the last row is rendered (NOT visible yet!) and we are not already loading data, then we fetch new data
        // If you want to fetch data when the last row is visible, use onVisibleRowChange
        if (lastRenderedDataIndex === lastRowIndex) {
            if (isLoading === false) {
                loadData();
            }
        }
    }
    return <FixedList onRenderedRowChange={onRenderedRowChange} .../>
}`;

const listPropsCode = `function MyList() {
    //...
    return <FixedList listProps={{className: "myList"}} .../>
}`;

const methodsCode = `function ScrollToDemo() {
    const data = Array(1000).fill(null).map((_, index) => \`item \${index}\`);
    const ref = React.useRef();
    return (
        <div>
                        <button onClick={() => ref.current?.scrollTo(350)} />
                        <button onClick={() => ref.current?.scrollToRow(9)} />
                        <button onClick={() => ref.current?.scrollToRow(-1)} />
                        <button onClick={() => ref.current?.scrollToDataIndex(86)} />
                        <FixedList height={300} rowComponent={Row} data={data} rowHeight={100} ref={ref}/>
                </div>
    )
}`;
