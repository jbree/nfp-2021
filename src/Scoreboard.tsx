import * as React from 'react'
import { useQuery } from 'react-query'
import { Draft, fetchDraft } from './queries/Draft'
import { Team, fetchTeams } from './queries/Teams'
import { TeamRecordIcon } from './TeamRecordIcon'
import './Scoreboard.scss'

const select = {
  selected: 2,
  options: [
    { value: 0 },
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
  ]
}

export function Scoreboard (): JSX.Element {
  const {data: draft} = useQuery<Draft>('draft', fetchDraft, { staleTime: process.env.NFP_STALE_TIME })
  const {data: teams} = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft!), { staleTime: process.env.NFP_STALE_TIME, enabled: !!draft })

  if (!teams || !draft) {
    return <div></div>
  }

  const results = draft.players.map(player => {
    const playerTeams = teams.filter(team => team.draft.owner === player)
    const playerScore = playerTeams.reduce((p, c) => p + c.points, 0)

    return {
      player: player,
      score: playerScore,
      teams: playerTeams,
    }
  })

  return (
    <>
      <h2 key='scoreboard'>Scoreboard</h2>
      <div className='table scoreboard'>
        <div className='row'>
          <div className='scoreboard-left'>
            <div className='scoreboard-score'><span className='mobile-hide'>Score</span></div>
            <div>Player</div>
          </div>
          <div className='scoreboard-teams'>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
          </div>
        </div>
        {
          results
            .sort((a, b) => b.score - a.score)
            .map(score => (
              <div key={score.player} className='row'>
                <div className='scoreboard-left'>
                  <div className='scoreboard-score'>{score.score}</div>
                  <div>{score.player}</div>
                </div>
                <div className='scoreboard-teams'>
                {
                  score.teams
                    .sort((a, b) => a.draft.round - b.draft.round)
                  .map(team => {
                    const r = team.record
                    return (
                      <div key={team.abbreviation}>
                        <TeamRecordIcon team={team} />
                      </div>
                    )
                  })
                }
                </div>
              </div>
            ))
        }
      </div>
    </>
  )
}
