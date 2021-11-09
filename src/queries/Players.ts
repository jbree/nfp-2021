// import { Config } from '../Config'

interface Draft {
  players: string[]
  picks: {
    owner: string
    team: string
    round: number
  }[]
}

export interface Player {
  name: string
  teams: string[]
}

function assertIsDraft(data: any): asserts data is Draft {
  if (!('players' in data) || !('picks' in data)) {
    throw new Error('Invalid draft data')
  }

  if (!Array.isArray(data.picks) || !Array.isArray(data.players)) {
    throw new Error('Invalid draft data')
  }

  // TODO validate players as strings
  // TODO validate picks
}

export async function fetchPlayers(): Promise<Player[]> {
  const response = await fetch(process.env.NFP_DRAFT_URI!)

  throw new Error('fuck you')
  if (!response.ok) {
    throw new Error('Problem fetching data')
  }

  const data = await response.json()

  assertIsDraft(data)

  return data.players
    .map(player => {
      return {
        name: player,
        teams: data.picks
          .filter(pick => pick.owner === player)
          .sort((a, b) => a.round - b.round)
          .map(pick => pick.team)
      }
    })
}
