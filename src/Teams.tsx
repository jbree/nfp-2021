import React from 'react'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { Draft, fetchDraft } from './queries/Draft'
import { Team, fetchTeams } from './queries/Teams'
import { Record } from './Record'
import { TeamIcon } from './TeamIcon'
import './Teams.scss'

/* eslint-disable @typescript-eslint/no-shadow */
enum TeamSortOrder {
  Draft = 'draft',
  Points = 'points',
  Record = 'record',
  Owner = 'owner',
}
/* eslint-enable @typescript-eslint/no-shadow */


export function Teams (): JSX.Element {
  const staleTime = Number(process.env.NFP_STALE_TIME)
  if (!staleTime) {throw new Error('env undefined: NFP_STALE_TIME')}

  const [sort, setSort] = useState(TeamSortOrder.Draft)
  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', fetchDraft, { staleTime })
  const { data: teams, status: teamsStatus } = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft), { staleTime, enabled: !!draft })

  const status = [draftStatus, teamsStatus]

  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !draft || !teams) {
    return <div>Error loading data</div>
  }

  const selectSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as TeamSortOrder)
  }

  const sortOrders = [
    { order: TeamSortOrder.Draft, name: 'Draft Order' },
    { order: TeamSortOrder.Record , name: 'Best Record' },
    { order: TeamSortOrder.Points , name: 'Most Points' },
    { order: TeamSortOrder.Owner, name: 'Team Owner' },
  ]

  return (
    <>
      <h2>Teams</h2>
      <label htmlFor='sort'>Sort by: </label>
      <select id='sort' onChange={selectSort}>
        {
          sortOrders.map<React.ReactNode>(s => (
            <option value={s.order} key={s.order}>{s.name}</option>
          ))
        }
      </select>
      <div className='table'>
        <div className='row flex' key='teams-header'>
          <div className='teams-owner'>Owner</div>
          <div className='flex center teams-team'>Team</div>
          <div className='flex center teams-stats'>
            <div className='teams-stat center'>Draft Round</div>
            <div className='teams-stat center'>Overall Pick</div>
            <div className='teams-stat center'>Points</div>
          </div>
        </div>
        {
          teams
            .sort((a, b) => {
              switch (sort) {
              case TeamSortOrder.Draft:
                return a.draft.overall - b.draft.overall

              case TeamSortOrder.Points:
                return b.points - a.points

              case TeamSortOrder.Owner:
                return a.draft.owner.localeCompare(b.draft.owner) ||
                  a.draft.overall - b.draft.overall

              default:
              case TeamSortOrder.Record:
                return b.record.wins === a.record.wins
                  ? a.record.losses === b.record.losses
                    ? a.record.ties === b.record.ties
                      ? b.points - a.points
                      : a.record.ties - b.record.ties
                    : a.record.losses - b.record.losses
                  : b.record.wins - a.record.wins
              }
            })
            .map(team => (
              <div className='row flex' key={team.abbreviation}>
                <div className='teams-owner'>{team.draft.owner}</div>
                <div className='flex center teams-team'>
                  <TeamIcon abbr={team.abbreviation} size={50} />
                  <div>{team.location} {team.name}</div>
                  <div>(<Record record={team.record} />)</div>
                </div>
                <div className='flex center teams-stats'>
                  <div className='teams-stat center'>{team.draft.round}</div>
                  <div className='teams-stat center'>{team.draft.overall}</div>
                  <div className='teams-stat center'>{team.points}</div>
                </div>
              </div>
            ))
        }
      </div>
    </>
  )
}
