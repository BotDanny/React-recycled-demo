import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import React from "react";
import "./root.scss";
import SideNav, { examples, introductions } from "./SideNav";

export default function Index() {
  const me = React.useRef();
  return (
    <div className="root-content">
      <SideNav />
      <main>
        <Switch>
          {examples.map(({ label, route, component }) => {
            const Page = component as any;
            return (
              <Route path={route} exact>
                {component && <Page />}
              </Route>
            );
          })}
          {introductions.map(({ label, route, component }) => {
            const Page = component as any;
            return (
              <Route path={route} exact>
                {component && <Page />}
              </Route>
            );
          })}
        </Switch>
      </main>
    </div>
  );
}
