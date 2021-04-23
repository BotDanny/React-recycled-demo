import React from "react";
import FixedList from "../FixedSizeList";
import { RowProps } from "../TypeDef";
import Highlight from "react-highlight.js";
import GeneralPage from "./GeneralPage";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { ReactWindowDemo } from "./ReactWindowComparison";
import { Alert } from "@material-ui/lab";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function Performance() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };
  return (
    <div>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="With react-recycled-list" />
          <Tab label="Without react-recycled-list" />
          <Tab label="With react-window" />
        </Tabs>
      </AppBar>
      <Box p={3} pb={1}>
        <Alert severity="error" variant="filled" style={{justifyContent: "center"}}>
          Attention! When measuring performance, make sure to use a production build and an incognito window! 
        </Alert>
      </Box>
      <TabPanel value={value} index={0}>
        <PerformanceDemo />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <NoOptimization />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ReactWindowDemo />
      </TabPanel>
    </div>
  );
}

function PerformanceDemo() {
  const data = Array(500)
    .fill(null)
    .map((_, index) => `item ${index}`);

  return (
    <FixedList height={800} rowComponent={Row} data={data} rowHeight={100} />
  );
}

const chips = Array(15)
  .fill(null)
  .map(() => undefined);

const handleClick = () => {};

const Row = React.memo(function (props: RowProps) {
  const { data, dataIndex, style } = props;
  const value = data[dataIndex];
  return (
    <div style={style as any} className="react-recycled-row">
      {chips.map((_, index) => (
        <Chip
          key={index}
          avatar={<Avatar>M</Avatar>}
          label="Clickable"
          onClick={handleClick}
        />
      ))}
    </div>
  );
});

const data = Array(500)
  .fill(null)
  .map((_, index) => undefined);

function NoOptimization() {
  return (
    <div className="no-optimization-list">
      {data.map((_, index) => (
        <div className="react-recycled-row" key={index} style={{ height: 100 }}>
          {chips.map((_, chipIndex) => (
            <Chip
              key={chipIndex}
              avatar={<Avatar>M</Avatar>}
              label="Clickable"
              onClick={handleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
