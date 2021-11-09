import { Player } from './Players'
import { Team } from './Teams'
import urljoin from 'url-join'

export interface MatchupTeam {
  team: string
  color: string
  score: number
  winner: boolean
}

export interface Matchup {
  home: MatchupTeam
  away: MatchupTeam
}

export interface WeeklyMatchups {
  matchups: Matchup[]
  week: number
  weeks: {
    title: string
    number: number
  }[]
}

interface ScoreboardData {
  leagues: {
    abbreviation: string
    calendar: {
      value: string
      entries: {
        detail: string
        label: string
        value: string
        startDate: string
        endDate: string
      }[]
    }[]
  }[]
  week: {
    number: number
  }
  events: {
    shortName: string
    competitions: {
      competitors: {
        homeAway: 'home' | 'away'
        team: {
          abbreviation: string
          color: string
        }
        score: string
        winner?: boolean
      }[]
    }[]
  }[]
}



function assertIsScoreboardData (data: any): asserts data is ScoreboardData {
  //FIXME!
}




export async function fetchMatchups (week?: number): Promise<WeeklyMatchups> {
  const base = process.env.NFP_SCOREBOARD_URI!
  const url = week ? urljoin(base, `?week=${week}`) : base
  
  console.log(`url: ${url}`)
  
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Problem fetching scoreboard data')
  }

  const data = await response.json()
  assertIsScoreboardData(data)

  const matchups: Matchup[] = data.events.map(event => {
    const competitors = event.competitions[0].competitors

    const h = competitors.find(c => c.homeAway === 'home')!
    const a = competitors.find(c => c.homeAway === 'away')!
    if (a.winner) {
      console.log(`${a.team.abbreviation} is a winner!`)
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
      }
    }
  })
  
  const weeks = data.leagues
    .find((league) => league.abbreviation === "NFL")!
    .calendar
    .find((calendar) => calendar.value === "2")!
    .entries.map((entry) => {
      return {
        title: entry.label,
        number: Number(entry.value),
      }
    })

  return {
    matchups,
    week: data.week.number,
    weeks,
  }
}
