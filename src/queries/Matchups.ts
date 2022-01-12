import urljoin from 'url-join'
import { assertIsScoreboardData } from '../schemas/ScoreboardData.jtd'

export interface MatchupTeam {
  team: string
  color?: string
  score: number
  winner: boolean
}

export interface Matchup {
  home: MatchupTeam
  away: MatchupTeam
  done: boolean
  date: number
  id: string
}

export interface WeeklyMatchups {
  matchups: Matchup[]
  byeTeams: string[]
  week: number
  weeks: {
    title: string
    number: number
  }[]
}

export async function fetchMatchups (week?: number): Promise<WeeklyMatchups> {
  const base = process.env.NFP_SCOREBOARD_URI

  const seasonType = (week && week < 18) ? 2 : 3
  if (week && seasonType === 3) {
    week -= 18
  }

  const url = week ? urljoin(base, `?week=${week}&seasontype=${seasonType}`) : base

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Problem fetching scoreboard data')
  }

  const data = await response.json() as unknown
  assertIsScoreboardData(data)

  const matchups: Matchup[] = data.events.map(event => {
    const competition = event.competitions[0]
    const competitors = competition.competitors
    const status = competition.status

    const done = status.type.completed && status.type.description === 'Final'

    const h = competitors.find(c => c.homeAway === 'home')
    const a = competitors.find(c => c.homeAway === 'away')

    if (!h || !a) {
      throw new Error('Failed to fetch Matchups')
    }

    return {
      home: {
        team: h.team.abbreviation,
        color: h.team.color,
        score: parseInt(h.score),
        winner: !!h.winner,
      },
      away: {
        team: a.team.abbreviation,
        color: a.team.color,
        score: parseInt(a.score),
        winner: !!a.winner,
      },
      id: competition.id,
      done,
      date: Date.parse(competition.date) || Infinity,
    }
  })

  const weeks = data.leagues
    .find((league) => league.abbreviation === 'NFL')
    ?.calendar
    .find((calendar) => calendar.value === '2')
    ?.entries.map((entry) => {
      return {
        title: entry.label,
        number: Number(entry.value),
      }
    })

  weeks?.push(...(data.leagues
    .find(league => league.abbreviation === 'NFL')
    ?.calendar
    .find(calendar => calendar.value === '3')
    ?.entries.map(entry => {
      return {
        title: entry.label,
        number: Number(entry.value) + 18,
      }
    }) || [])
  )

  if (!weeks) {
    throw new Error('fetchMatchups() failed')
  }

  const byeTeams = data.week.teamsOnBye?.map(team => team.abbreviation) ?? []

  return {
    matchups,
    week: data.week.number,
    weeks,
    byeTeams,
  }
}
