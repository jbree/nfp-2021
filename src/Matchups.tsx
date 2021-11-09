import * as React from 'react'
import { useState } from 'react';
import { useQuery } from 'react-query'
import { fetchMatchups, WeeklyMatchups } from './queries/Matchups'
import { fetchDraft, Draft } from './queries/Draft'
import { fetchTeams, Team } from './queries/Teams'
import { Record } from './Record'
import { TeamIcon } from './TeamIcon'
import { TeamRecordIcon } from './TeamRecordIcon'
import './Matchups.scss'

export function Matchups (): JSX.Element {
  const [week, setWeek] = useState("")
  const { data, status: matchupsStatus } = useQuery<WeeklyMatchups>(['matchups', week], ({ pageParam = week }) => fetchMatchups(pageParam))
  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', fetchDraft)
  const { data: teams, status: teamsStatus } = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft!), { staleTime: 60000, enabled: !!draft })

  const selectWeek = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(`selected ${e.target.value}`)
    setWeek(e.target.value)
  }
  
  const status = [matchupsStatus, draftStatus, teamsStatus]
  
  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !data || !draft || !teams) {
    return <div>Error loading data</div>
  }
  
  return (
    <>
      <h2>Week {data.week} Matchups</h2>
      <select id='sort' onChange={selectWeek}>
        {
          data.weeks
            .map<React.ReactNode>(w => (
              <option value={w.number}
                  key={w.number} selected={w.number === data.week}>
                {w.title}
              </option>
            ))
            .reduce((prev, curr) => [prev, ' | ', curr])
        }
      </select>
      <table>
        <tbody>
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
                  <tr key={`${matchup.away.team}@${matchup.home.team}`}>
                    {/* <td style={{backgroundColor: `#${matchup.away.color}`, width: '20px'}}></td> */}
                    {/* <td></> */}
                    <td className='left'>
                      <div className={matchup.away.winner ? 'winner' : ''}>{ap?.owner}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={matchup.away.winner ? 'winner' : ''} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        (<Record record={away.record} />)
                        <div className={matchup.away.winner ? 'winner' : ''}>{away.name}</div>
                        <TeamIcon abbr={away.abbreviation} size={45} />
                      </div>
                    </td>
                    <td style={{ aspectRatio: '1', width: '40px' }}>@</td>
                    <td style={{ textAlign: 'left' }}>
                      <div className={matchup.home.winner ? 'winner' : ''} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                        <TeamIcon abbr={home.abbreviation} size={45} />
                        <div className={matchup.home.winner ? 'winner' : ''}>{home.name}</div>
                        (<Record record={home.record} />)
                      </div>
                    </td>
                    <td className='right'>
                      <div className={matchup.home.winner ? 'winner' : ''}>{hp?.owner}</div>
                    </td>
                    {/* <td style={{backgroundColor: `#${matchup.home.color}`, width: '20px'}}></td> */}
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </>
  )
}
