import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import React from "react";
import "./root.scss";
import SideNav, { components, examples, introductions } from "./SideNav";

export default function Index() {
  return (
    <div className="root-content">
      <SideNav />
      <main>
        <Switch>
          {examples.map(({ label, route, component }) => {
            const Page = component as any;
            return (
              <Route path={route} exact>
                <Page />
              </Route>
            );
          })}
          {introductions.map(({ label, route, component }) => {
            const Page = component as any;
            return (
              <Route path={route} exact>
                <Page />
              </Route>
            );
          })}
          {components.map(({ label, route, component }) => {
            const Page = component as any;
            return (
              <Route path={route} exact>
                <Page />
              </Route>
            );
          })}
        </Switch>
      </main>
    </div>
  );
}
