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
import { Link } from "react-router-dom";

export default function SideNav() {
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
          <ListItem button className="second-level" component={Link} to="/">
            <ListItemText primary="Why use React recycled list" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Examples" className="first-level" />
          </ListItem>
          {examples.map(({ label, route }) => (
            <ListItem button key={label} className="second-level" component={Link} to={route}>
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
            <ListItem button key={label} className="second-level" component={Link} to={route}>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}

export const examples = [
    { label: "Simple List", route: "/simple-list" },
    { label: "Simple Grid", route: "/simple-grid" },
    { label: "Variable row height", route: "/variable-row-height" },
    { label: "Variable column", route: "/variable-column" },
    { label: "Full window", route: "/full-window" },
    { label: "Custom window", route: "/custom-window" },
    { label: "Responsive List/Grid", route: "/responsive-list/grid" },
    { label: "Responsive window", route: "/responsive-window" },
    { label: "Lazy loading", route: "/lazy-loading" },
    { label: "Dynamic loading", route: "/dynamic-loading" },
    { label: "Scroll indicator", route: "/scroll-indicator" },
    { label: "Scroll to", route: "/scroll-to" },
  ];
  
  export const components = [
    { label: "FixedSizeList", route: "/fixedsizelist" },
    { label: "VariableSizeList", route: "/variablesizelist" },
    { label: "FixedSizeWindowList", route: "/fixedsizewindowlist" },
    { label: "VariableSizeWindowList", route: "/variablesizewindowList" },
    { label: "ResponsiveContainer", route: "/rResponsivecontainer" },
    { label: "ResponsiveWindowContainer", route: "/responsiveWindowcontainer" },
  ];
  