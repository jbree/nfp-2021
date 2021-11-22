import React from 'react'
import { useQuery } from 'react-query'
import { Draft, fetchDraft } from './queries/Draft'
import { Team, fetchTeams } from './queries/Teams'
import { TeamRecordIcon } from './TeamRecordIcon'
import './Scoreboard.scss'

export function Scoreboard (): JSX.Element {
  const staleTime = Number(process.env.NFP_STALE_TIME)

  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', () => fetchDraft(), { staleTime })
  const { data: teams, status: teamsStatus } = useQuery<Team[]>(['teams', draft], () => fetchTeams(draft), { staleTime, enabled: !!draft })

  const status = [draftStatus, teamsStatus]

  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !draft || !teams) {
    return <div>Error loading data</div>
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
      <h2 key='scoreboard'>Leaderboard</h2>
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
                        return (
                          <div className='scoreboard-team' key={team.abbreviation}>
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
