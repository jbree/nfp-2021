import Ajv, { JTDDataType } from 'ajv/dist/jtd'
const ajv = new Ajv()

const TeamSchema = {
  additionalProperties: true,
  properties: {
    team: {
      additionalProperties: true,
      properties: {
        location: { type: 'string' },
        displayName: { type: 'string' },
        standingSummary: { type: 'string' },
        recordSummary: { type: 'string' },
      },
      optionalProperties: {
        name: { type: 'string' },
      },
    },
    events: {
      elements: {
        additionalProperties: true,
        properties: {
          week: {
            additionalProperties: true,
            properties: {
              number: { type: 'int32' },
            },
          },
        },
      },
    },
  },
} as const

export type Draft = JTDDataType<typeof TeamSchema>
const validate = ajv.compile<Draft>(TeamSchema)

export function assertIsEspnTeamData (data: unknown): asserts data is Draft {
  if (!validate(data)) {
    throw new Error('ESPN team data not in expected format')
  }
}
