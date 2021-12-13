import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import { Rules } from './Rules'
import { Scoreboard } from './Scoreboard'
import { TeamDetail } from './TeamDetail'
import { Teams } from './Teams'
import { Matchups } from './Matchups'
import { Menu } from './Menu'

const queryClient = new QueryClient()


export default function App () {
  return (
    <Router>
      <Menu />
      <div className="container">
        <QueryClientProvider client={queryClient}>
          <Switch>
            <Route path="/teams/:team" component={ TeamDetail } />
            <Route path="/teams" component={ Teams } />
            <Route path="/matchups/:week" component={ Matchups } />
            <Route path="/matchups" component={ Matchups } />
            <Route path="/rules" component={ Rules } />
            <Route path="/" component={ Scoreboard } />
          </Switch>
        </QueryClientProvider>
      </div>
    </Router>
  )
}
