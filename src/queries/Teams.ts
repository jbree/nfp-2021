import { Draft } from './Draft'
import { assertIsEspnTeamsData } from '../schemas/EspnTeamsData.jtd'

export interface TeamRecord {
  wins: number
  losses: number
  ties: number
}

export interface Team {
  name: string
  location: string
  abbreviation: string
  draft: {
    owner: string
    round: number
    overall: number
  }
  record: TeamRecord
  points: number
  playoffPoints: number
}

const PLAYOFF_POINTS_BYE_WEEK = 4
const PLAYOFF_POINTS_DIVISION_CHAMP = 8
const PLAYOFF_POINTS_WILD_CARD_BERTH = 5
const PLAYOFF_POINTS_WILD_CARD_WIN = 4
const PLAYOFF_POINTS_DIVISION_ROUND_WIN = 10
const PLAYOFF_POINTS_CONFERENCE_WIN = 10
const PLAYOFF_POINTS_SUPERBOWL_WIN = 10

interface StatsRecord {
  name: string
  value: number
}

function getPlayoffPoints (stats: StatsRecord[]): number {
  const seed = stats.find(stat => stat.name === 'playoffSeed')?.value

  if (!seed) {
    return 0
  }

  let points = 0

  if (seed === 1.0) {
    points += PLAYOFF_POINTS_BYE_WEEK
  }

  if (seed <= 4.0) {
    points += PLAYOFF_POINTS_DIVISION_CHAMP
  }
  else if (seed <= 7.0) {
    points += PLAYOFF_POINTS_WILD_CARD_BERTH
  }

  return points
}

export async function fetchTeams (draft?: Draft): Promise<Team[]> {
  if (!draft) {
    throw new Error('fetchTeams() received falsy Draft')
  }

  const response = await fetch(process.env.NFP_TEAMS_URI)
  if (!response.ok) {
    throw new Error('Problem fetching data')
  }
  const data = await response.json() as unknown

  assertIsEspnTeamsData(data)

  const teams = data.sports
    .find(sport => sport.slug === 'football')
    ?.leagues
    .find(league => league.slug === 'nfl')
    ?.teams

  if (!teams) {
    throw new Error('ESPN data isn\'t what we wanted')
  }

  return teams.map(team => {
    const t = team.team

    const stats = t.record.items[0].stats
    const record = {
      wins: stats.find(stat => stat.name === 'wins')?.value ?? 0,
      losses: stats.find(stat => stat.name === 'losses')?.value ?? 0,
      ties: stats.find(stat => stat.name === 'ties')?.value ?? 0,
    }

    const pick = draft.picks.find(p => p.team === t.abbreviation)

    if (!pick) {
      return
    }

    return {
      name: t.name ?? 'Football Team',
      abbreviation: t.abbreviation,
      location: t.location,
      record: record,
      draft: {
        owner: pick.owner,
        overall: draft.picks.findIndex(p => p.team === t.abbreviation) + 1,
        round: pick.round,
      },
      points: pick.round * record.wins,
      playoffPoints: getPlayoffPoints(stats),
    }
  }).filter((team): team is Team => !!team)

}
