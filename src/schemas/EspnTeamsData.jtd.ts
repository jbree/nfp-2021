import Ajv, { JTDDataType } from 'ajv/dist/jtd'
const ajv = new Ajv()

const EspnTeamSchema = {
  additionalProperties: true,
  properties: {
    team: {
      additionalProperties: true,
      optionalProperties: {
        name: { type: 'string' },
      },
      properties: {
        abbreviation: { type: 'string' },
        location: { type: 'string' },
        record: {
          additionalProperties: true,
          properties: {
            items: {
              elements: {
                additionalProperties: true,
                properties: {
                  summary: { type: 'string' },
                  stats: {
                    elements: {
                      additionalProperties: true,
                      properties: {
                        name: { type: 'string' },
                        value: { type: 'float32' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const

const EspnDataSchema = {
  additionalProperties: true,
  properties: {
    sports: {
      elements: {
        additionalProperties: true,
        properties: {
          slug: { type: 'string' },
          leagues: {
            elements: {
              additionalProperties: true,
              properties: {
                slug: { type: 'string' },
                teams: {
                  elements: EspnTeamSchema,
                },
              },
            },
          },
        },
      },
    },
  },
} as const

export type EspnTeamsData = JTDDataType<typeof EspnDataSchema>
const validate = ajv.compile<EspnTeamsData>(EspnDataSchema)


export function assertIsEspnTeamsData (data: unknown): asserts data is EspnTeamsData {
  if (!validate(data)) {
    throw new Error('ESPN data is not in expected format')
  }
}
