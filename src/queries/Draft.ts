export interface Draft {
  players: string[]
  picks: {
    owner: string
    team: string
    round: number
  }[]
}

function assertIsDraft (data: any): asserts data is Draft {
  if (!('players' in data) || !('picks' in data)) {
    throw new Error('Invalid draft data')
  }

  if (!Array.isArray(data.picks) || !Array.isArray(data.players)) {
    throw new Error('Invalid draft data')
  }

  // TODO validate players as strings
  // TODO validate picks
}

export async function fetchDraft (): Promise<Draft> {
  const response = await fetch(process.env.NFP_DRAFT_URI!)

  if (!response.ok) {
    throw new Error('Problem fetching data')
  }

  const data = await response.json()

  assertIsDraft(data)

  return data
}
