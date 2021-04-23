import React from "react";
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import "./root.scss";
import { Link, useLocation } from "react-router-dom";
import SimpleList from "./pages/SimpleList";
import SimpleGrid from "./pages/SimpleGrid";
import VariableRowHeight from "./pages/VariableRowHeight";
import VariableColumn from "./pages/VariableColumn";
import FullWindow from "./pages/FullWindow";
import VariableRowHeightColumn from "./pages/VariableRowHeightColumn";
import CustomWindow from "./pages/CustomWindow";
import ResponsiveContainerPage from "./pages/ResponsiveContainer";
import FullWindowResponsiveContainerPage from "./pages/FullWindowResponsiveContainer";
import LazyLoadingAdvanced from "./pages/LazyLoadingAdvanced";
import LazyLoadingSimple from "./pages/LazyLoadingSimple";
import ReactWindowComparison from "./pages/ReactWindowComparison";
import DynamicLoading from "./pages/DynamicLoading";
import ScrollIndicator from "./pages/ScrollIndicator";
import ScrollTo from "./pages/ScrollTo";
import Performance from "./pages/Performance";

export default function SideNav() {
  const { pathname } = useLocation();
  return (
    <div>
      <Drawer variant="permanent" anchor="left">
        <Typography variant="h6" className="site-title">
          React recycled list
        </Typography>
        <Divider />
        <List>
          <ListItem>
            <ListItemText primary="Introduction" className="first-level" />
          </ListItem>
          {introductions.map(({ label, route }) => (
            <ListItem
              button
              key={label}
              className="second-level"
              component={Link}
              to={route}
              selected={pathname === route}
            >
              <ListItemText primary={label} />
            </ListItem>
          ))}
          <ListItem>
            <ListItemText primary="Examples" className="first-level" />
          </ListItem>
          {examples.map(({ label, route }) => (
            <ListItem
              button
              key={label}
              className="second-level"
              component={Link}
              to={route}
              selected={pathname === route}
            >
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem>
            <ListItemText primary="Components" className="first-level" />
          </ListItem>
          {components.map(({ label, route }) => (
            <ListItem
              button
              key={label}
              className="second-level"
              component={Link}
              to={route}
              selected={pathname === route}
            >
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}

export const introductions = [
  {
    label: "Why use react recycled list",
    route: "/",
  },
  { label: "Performance", route: "/performance", component: Performance },
];

export const examples = [
  { label: "Simple List", route: "/simple-list", component: SimpleList },
  //   { label: "VS React window", route: "/react-window", component: ReactWindowComparison },
  { label: "Simple Grid", route: "/simple-grid", component: SimpleGrid },
  {
    label: "Variable row height",
    route: "/variable-row-height",
    component: VariableRowHeight,
  },
  {
    label: "Variable column",
    route: "/variable-column",
    component: VariableColumn,
  },
  {
    label: "Variable row height + column ",
    route: "/variable-height-column",
    component: VariableRowHeightColumn,
  },
  { label: "Full window", route: "/full-window", component: FullWindow },
  { label: "Custom window", route: "/custom-window", component: CustomWindow },
  {
    label: "Responsive List/Grid",
    route: "/responsive-list/grid",
    component: ResponsiveContainerPage,
  },
  {
    label: "Responsive window",
    route: "/responsive-window",
    component: FullWindowResponsiveContainerPage,
  },
  {
    label: "Simple Infinite loading",
    route: "/lazy-loading-simple",
    component: LazyLoadingSimple,
  },
  {
    label: "Advanced Infinite loading",
    route: "/lazy-loading-advance",
    component: LazyLoadingAdvanced,
  },
  {
    label: "Dynamic loading",
    route: "/dynamic-loading",
    component: DynamicLoading,
  },
  {
    label: "Scroll indicator",
    route: "/scroll-indicator",
    component: ScrollIndicator,
  },
  { label: "Scroll to", route: "/scroll-to", component: ScrollTo },
  { label: "Scroll restoration", route: "/scroll-restoration" },
  { label: "Styling", route: "/styling" },
  { label: "Server side rendering", route: "/styling" },
];

export const components = [
  { label: "FixedSizeList", route: "/fixedsizelist" },
  { label: "VariableSizeList", route: "/variablesizelist" },
  { label: "FixedSizeWindowList", route: "/fixedsizewindowlist" },
  { label: "VariableSizeWindowList", route: "/variablesizewindowList" },
  { label: "ResponsiveContainer", route: "/rResponsivecontainer" },
  { label: "ResponsiveWindowContainer", route: "/responsiveWindowcontainer" },
];
