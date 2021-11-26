import { TeamRecord } from './Teams'
import { Draft } from './Draft'
import { assertIsEspnTeamData } from '../schemas/Team.jtd'
import urljoin from 'url-join'

export interface TeamDetails {
  name: string
  location: string
  abbreviation: string
  draft: {
    owner: string
    round: number
    overall: number
  }
  record: TeamRecord
  recordSummary: string
  standingSummary: string
  points: number
}



export async function fetchTeamDetails (abbreviation: string, draft?: Draft): Promise<TeamDetails> {
  if (!draft) {
    throw new Error('fetchTeam() received falsy Draft')
  }

  const url = urljoin(
      process.env.NFP_TEAM_URI_PREFIX,
      abbreviation,
      process.env.NFP_TEAM_URI_POSTFIX)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Problem fetching data')
  }
  const data = await response.json() as unknown

  assertIsEspnTeamData(data)

  const pick = draft.picks.find(p => p.team === abbreviation.toUpperCase())
  if (!pick) {
    throw new Error('ESPN data isn\'t what we wanted')
  }

  const [wins, losses, ties] = data.team.recordSummary.split('-').map(n => Number(n))
  const record = { wins, losses, ties }

  return {
    name: data.team.name ?? 'Football Team',
    location: data.team.location,
    abbreviation,
    draft: {
      owner: pick.owner,
      overall: draft.picks.findIndex(p => p.team === abbreviation) + 1,
      round: pick.round,
    },
    record: record,
    recordSummary: data.team.recordSummary,
    standingSummary: data.team.standingSummary,
    points: pick.round * record.wins,
  }
}
