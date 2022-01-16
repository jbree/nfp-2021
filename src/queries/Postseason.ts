export type Postseason = Record<string, number>

function assertIsPostseason (data: unknown): asserts data is Postseason {
  if (typeof data !== 'object') {
    throw new TypeError('Postseason data in unexpected format')
  }
}

export async function fetchPostseason (): Promise<Postseason> {
  const response = await fetch(process.env.NFP_POSTSEASON_URI)

  if (!response.ok) {
    throw new Error('Problem fetching postseason data')
  }

  const data = await response.json() as unknown
  assertIsPostseason(data)

  return data
}
