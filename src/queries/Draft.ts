import { Draft, assertIsDraft } from '../schemas/Draft.jtd'
export { Draft } from '../schemas/Draft.jtd'

export async function fetchDraft (): Promise<Draft> {
  const response = await fetch(process.env.NFP_DRAFT_URI)

  if (!response.ok) {
    throw new Error('Problem fetching data')
  }

  const data = await response.json() as unknown
  assertIsDraft(data)

  return data
}
