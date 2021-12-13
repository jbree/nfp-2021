import React from 'react'
import { Link } from 'react-router-dom'
import GithubCorner from 'react-github-corner'
import './Menu.scss'

export function Menu (): JSX.Element {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to='/'>Leaderboard</Link></li>
          <li><Link to='/teams'>Teams</Link></li>
          <li><Link to="/matchups">Matchups</Link></li>
          <li><Link to="/rules">Rules</Link></li>
        </ul>
      </nav>
      <GithubCorner href='https://github.com/jbree/nfp-2021' size={64} bannerColor='white' octoColor='#4A412A' />
    </header>
  )
}
