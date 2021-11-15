import React from 'react'
import { useState } from 'react';
import { useQuery } from 'react-query'
import { fetchMatchups, WeeklyMatchups } from './queries/Matchups'
import { fetchDraft, Draft } from './queries/Draft'
import { fetchTeams, Team } from './queries/Teams'
import { Record } from './Record'
import { TeamIcon } from './TeamIcon'
import classNames from 'classnames'
import './Matchups.scss'

export function Matchups (): JSX.Element {
  const [week, setWeek] = useState(0)
  const { data, status: matchupsStatus } = useQuery<WeeklyMatchups>(['matchups', week], ({ pageParam = week }) => fetchMatchups(pageParam))
  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', fetchDraft)
  const { data: teams, status: teamsStatus } = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft!), { staleTime: 60000, enabled: !!draft })

  const selectWeek = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeek(Number(e.target.value))
  }
  
  const status = [matchupsStatus, draftStatus, teamsStatus]
  
  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !data || !draft || !teams) {
    return <div>Error loading data</div>
  }
  
  const selectedWeek = week || data.week
  
  return (
    <>
      <h2>Week {selectedWeek} Matchups</h2>
      <select id='sort' onChange={selectWeek} value={selectedWeek}>
        {
          data.weeks
            .map<React.ReactNode>(w => (
              <option value={w.number} key={w.number}>{w.title}</option>
            ))
            .reduce((prev, curr) => [prev, ' | ', curr])
        }
      </select>
      <div className='table'>
        {
          data.matchups
            .map(matchup => {
              const hp = draft.picks.find(pick => pick.team === matchup.home.team)
              const ap = draft.picks.find(pick => pick.team === matchup.away.team)

              const home = teams.find(team => team.abbreviation === matchup.home.team)
              const away = teams.find(team => team.abbreviation === matchup.away.team)

              if (!home || !away) {
                return <></>
              }

              return(
                <div className='row matchup' key={`${matchup.away.team}@${matchup.home.team}`}>
                  <div className='left name'>
                    <div className={matchup.away.winner ? 'winner' : ''}>{ap?.owner}</div>
                  </div>
                  <div className='matchup flex'>
                    <div className='right team flex center'>
                      <div className={classNames('flex', { winner: matchup.away.winner })}>
                        (<Record record={away.record} />)
                      </div>
                      <div className={classNames({ winner: matchup.away.winner })}>{away.name}</div>
                      <TeamIcon abbr={away.abbreviation} size={45} />
                    </div>
                    <div>@</div>
                    <div className={classNames('left team flex center', { winner: matchup.home.winner })}>
                      <TeamIcon abbr={home.abbreviation} size={45} />
                      <div>{home.name}</div>
                      <div>(<Record record={home.record} />)</div>
                    </div>
                  </div>
                  <div className={classNames('right name', { winner: matchup.home.winner })}>{hp?.owner}</div>
                </div>
              )
            })
        }
      </div>
    </>
  )
}
