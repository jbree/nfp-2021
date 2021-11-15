import React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query'
import { Draft, fetchDraft } from './queries/Draft'
import { Team, fetchTeams } from './queries/Teams'
import { Record } from './Record'
import { TeamIcon } from './TeamIcon'

enum TeamSortOrder {
  Draft = 'draft',
  Points = 'points',
  Record = 'record',
  Owner = 'owner',
}


export function Teams(): JSX.Element {
  const [sort, setSort] = useState(TeamSortOrder.Draft)

  const {data: draft} = useQuery<Draft>('draft', fetchDraft, { staleTime: process.env.NFP_STALE_TIME! })
  const {data: teams} = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft!), { staleTime: process.env.NFP_STALE_TIME!, enabled: !!draft })

  const selectSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as TeamSortOrder)
  }

  if (!draft || !teams) {
    return <></>
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
      <label htmlFor='sort'>Sort by:</label>
      <select id='sort' onChange={selectSort}>
        {
          sortOrders
            .map<React.ReactNode>(s => (
              <option value={s.order}
                  key={s.order}>
                {s.name}
              </option>
            ))
            .reduce((prev, curr) => [prev, ' | ', curr])
        }
      </select>
        {/* <thead>
          <tr>
            <th>Team</th>
            <th>Record</th>
            <th>Owner</th>
            <th>Overall Pick</th>
            <th>Draft Round</th>
            <th>Points</th>
          </tr>
        </thead> */}
      <div className='table'>
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
          <div className='row' key={team.abbreviation}>
            <div className='flex center'>
              <TeamIcon abbr={team.abbreviation} size={50} />
              <div>{team.location} {team.name}</div>
              <div>(<Record record={team.record} />)</div>
            </div>
            <div className=''>
              <div className=''>{team.draft.owner}</div>
              <div className=''>{team.draft.round}</div>
              <div className=''>{team.draft.overall}</div>
              <div>Pts: {team.points}</div>
            </div>
          </div>
        ))
      }
      </div>
    </>
  )
}
