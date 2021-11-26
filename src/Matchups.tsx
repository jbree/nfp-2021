import React from 'react'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams, RouteComponentProps } from 'react-router-dom'
import { fetchMatchups, WeeklyMatchups } from './queries/Matchups'
import { fetchDraft, Draft } from './queries/Draft'
import { fetchTeams, Team } from './queries/Teams'
import { Record } from './Record'
import { TeamIcon } from './TeamIcon'
import classNames from 'classnames'
import './Matchups.scss'

enum MatchupSortOrder {
  Points = 'points',
  GameTime = 'time',
}

const sortOrders = [
  { order: MatchupSortOrder.Points , name: 'Most Consequential' },
  { order: MatchupSortOrder.GameTime, name: 'Game Time' },
]

interface MatchupParams {
  week: string
}

export function Matchups (props: RouteComponentProps): JSX.Element {
  const [week, setWeek] = useState(Number(useParams<MatchupParams>().week) ?? 0)
  const [sort, setSort] = useState(MatchupSortOrder.Points)

  const { data, status: matchupsStatus } = useQuery<WeeklyMatchups>(['matchups', week], () => fetchMatchups(week))
  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', () => fetchDraft())
  const { data: teams, status: teamsStatus } = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft), { staleTime: 60000, enabled: !!draft })

  const selectSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as MatchupSortOrder)
  }

  const selectWeek = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeek(Number(e.target.value))
    props.history.replace(`/matchups/${e.target.value}`)
  }

  const status = [matchupsStatus, draftStatus, teamsStatus]

  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !data || !draft || !teams) {
    return <div>Error loading data</div>
  }

  const selectedWeek = week || data.week

  const matchups = sort === MatchupSortOrder.Points
    ? [...data.matchups].sort((a, b) => {
      const ah = draft.picks.find(pick => pick.team === a.home.team)?.round ?? 0
      const aa = draft.picks.find(pick => pick.team === a.away.team)?.round ?? 0
      const bh = draft.picks.find(pick => pick.team === b.home.team)?.round ?? 0
      const ba = draft.picks.find(pick => pick.team === b.away.team)?.round ?? 0

      return (bh + ba) - (ah + aa)
    })
    : [...data.matchups].sort((a, b) => a.date - b.date)

  return (
    <>
      <h2>Week {selectedWeek} Matchups</h2>
      <p>
        <select id='week' key='select-week' onChange={selectWeek} value={selectedWeek}>
          {
            data.weeks
              .map<React.ReactNode>(w => (
              <option value={w.number} key={w.number}>{w.title}</option>
            ))
          }
        </select>
      </p>
      <p>
        <label htmlFor='sort'>Sort by: </label>
        <select id='sort' key='select-sort' onChange={selectSort} value={sort}>
          {
            sortOrders
              .map<React.ReactNode>(s => (
              <option value={s.order} key={s.name}>{s.name}</option>
            ))
          }
        </select>
      </p>
      <div className='table'>
        {
          matchups.map(matchup => {
            const hp = draft.picks.find(pick => pick.team === matchup.home.team)
            const ap = draft.picks.find(pick => pick.team === matchup.away.team)

            const home = teams.find(team => team.abbreviation === matchup.home.team)
            const away = teams.find(team => team.abbreviation === matchup.away.team)

            if (!home || !away || !hp || !ap) {
              return <></>
            }

            return(
              <div className='row matchup' key={`${matchup.away.team}@${matchup.home.team}`}>
                <div className={classNames('left name', { winner: matchup.away.winner, done: matchup.done })}>
                  {
                    matchup.away.winner && matchup.done
                      ? `${ap.owner} +${away.draft.round}`
                      : `${ap.owner} (${away.draft.round})`
                  }
                </div>
                <div className='matchup flex'>
                  <div className={classNames('right team flex center', { winner: matchup.away.winner, done: matchup.done })}>
                    <div className={classNames('flex')}>
                        (<Record record={away.record} />)
                    </div>
                    <div className={classNames({ winner: matchup.away.winner })}>{away.name}</div>
                    <TeamIcon abbr={away.abbreviation} size={45} />
                  </div>
                  <div>@</div>
                  <div className={classNames('left team flex center', { winner: matchup.home.winner, done: matchup.done })}>
                    <TeamIcon abbr={home.abbreviation} size={45} />
                    <div>{home.name}</div>
                    <div>(<Record record={home.record} />)</div>
                  </div>
                </div>
                <div className={classNames('right name', { winner: matchup.home.winner, done: matchup.done })}>
                  {
                    matchup.home.winner && matchup.done
                      ? `${hp.owner} +${home.draft.round}`
                      : `${hp.owner} (${home.draft.round})`
                  }
                </div>
              </div>
            )
          })
        }
      </div>
      {
        !data.byeTeams.length
          ? <></>
          : <div>
            <h3>
                Teams on Bye Week
            </h3>
            <div className='flex center bye-teams'>
              {
                data.byeTeams.map(byeTeam => {
                  const team = teams.find(t => t.abbreviation === byeTeam)
                  const pick = draft.picks.find(p => p.team === byeTeam)

                  return <div className='flex center bye-team' key={byeTeam}>
                    <TeamIcon abbr={byeTeam} size={45} />
                    <div>{pick?.owner}'s {team?.name} ({pick?.round})</div>
                  </div>
                })
              }
            </div>
          </div>
      }
    </>
  )
}
