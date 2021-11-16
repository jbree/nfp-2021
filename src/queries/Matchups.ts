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
  done: boolean
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
    teamsOnBye: {
      abbreviation: string
    }[]
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
      status: {
        type: {
          completed: boolean
          description: string
        }
      }
    }[]
  }[]
}


function assertIsScoreboardData (data: any): asserts data is ScoreboardData {
  //FIXME!
}


export async function fetchMatchups (week?: number): Promise<WeeklyMatchups> {
  const base = process.env.NFP_SCOREBOARD_URI!
  const url = week ? urljoin(base, `?week=${week}`) : base
  
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Problem fetching scoreboard data')
  }

  const data = await response.json()
  assertIsScoreboardData(data)

  const matchups: Matchup[] = data.events.map(event => {
    const competitors = event.competitions[0].competitors
    const status = event.competitions[0].status
    
    const done = status.type.completed && status.type.description === 'Final'

    const h = competitors.find(c => c.homeAway === 'home')!
    const a = competitors.find(c => c.homeAway === 'away')!
    
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
      done
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

  const byeTeams = data.week.teamsOnBye?.map(team => team.abbreviation) ?? []

  return {
    matchups,
    week: data.week.number,
    weeks,
    byeTeams,
  }
}
