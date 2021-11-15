import React from "react";
import { QueryClient, QueryClientProvider } from 'react-query'
import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom"
import { Scoreboard } from './Scoreboard'
import { Teams } from './Teams'
import { Matchups } from './Matchups'
import { Menu } from './Menu'

const queryClient = new QueryClient()


export default function App() {
  return (
    <Router>
      <Menu />
        <div className="container">
          <QueryClientProvider client={queryClient}>
            <Switch>
              <Route path="/teams">
                <Teams />
              </Route>
              <Route path="/matchups">
                <Matchups />
              </Route>
              <Route path="/">
                <Scoreboard />
              </Route>
            </Switch>
          </QueryClientProvider>
        </div>
    </Router>
  );
}
