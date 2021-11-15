import React from 'react'
import { Link } from "react-router-dom";
import './Menu.scss'

export function Menu (): JSX.Element {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to='/'>Leaderboard</Link></li>
          <li><Link to='/teams'>Teams</Link></li>
          <li><Link to="/matchups">Matchups</Link></li>
        </ul>
      </nav>
    </header>
  )
}
