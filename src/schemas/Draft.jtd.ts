import Ajv, { JTDDataType } from 'ajv/dist/jtd'
const ajv = new Ajv()

const DraftSchema = {
  properties: {
    players: {
      elements: {
        type: 'string',
      },
    },
    picks: {
      elements: {
        properties: {
          owner: { type: 'string' },
          team: { type: 'string' },
          round: { type: 'uint32' },
        },
      },
    },
  },
} as const

export type Draft = JTDDataType<typeof DraftSchema>
const validate = ajv.compile<Draft>(DraftSchema)

export function assertIsDraft (data: unknown): asserts data is Draft {
  if (!validate(data)) {
    throw new Error('Draft data is not in expected format')
  }
}
