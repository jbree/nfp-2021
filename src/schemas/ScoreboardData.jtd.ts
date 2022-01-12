import Ajv, { JTDDataType } from 'ajv/dist/jtd'
const ajv = new Ajv()

const ScoreboardLeagues = {
  additionalProperties: true,
  properties: {
    abbreviation: { type: 'string' },
    calendar: {
      elements: {
        additionalProperties: true,
        properties: {
          value: { type: 'string' },
          entries: {
            elements: {
              additionalProperties: true,
              properties: {
                detail: { type: 'string' },
                label: { type: 'string' },
                value: { type: 'string' },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const

const ScoreboardEventCompetitor = {
  additionalProperties: true,
  properties: {
    homeAway: {
      enum: ['home', 'away'],
    },
    team: {
      additionalProperties: true,
      properties: {
        abbreviation: { type: 'string' },
      },
      optionalProperties: {
        color: { type: 'string' },
      },
    },
    score: { type: 'string' },
  },
  optionalProperties: {
    winner: { type: 'boolean' },
  },
} as const

const ScoreboardEvents = {
  additionalProperties: true,
  properties: {
    shortName: { type: 'string' },
    competitions: {
      elements: {
        additionalProperties: true,
        properties: {
          id: { type: 'string' },
          competitors: {
            elements: ScoreboardEventCompetitor,
          },
          status: {
            additionalProperties: true,
            properties: {
              type: {
                additionalProperties: true,
                properties: {
                  completed: { type: 'boolean' },
                  description: { type: 'string' },
                },
              },
            },
          },
          date: { type: 'string' },
          timeValid: { type: 'boolean' },
        },
      },
    },
  },
} as const

const ScoreboardSchema = {
  additionalProperties: true,
  properties: {
    season: {
      additionalProperties: true,
      properties: {
        type: { type: 'uint32' },
      },
    },
    week: {
      additionalProperties: true,
      properties: {
        number: { type: 'uint32' },
      },
      optionalProperties: {
        teamsOnBye: {
          elements: {
            additionalProperties: true,
            properties: {
              abbreviation: { type: 'string' },
            },
          },
        },
      },
    },
    leagues: { elements: ScoreboardLeagues },
    events: { elements: ScoreboardEvents },
  },
} as const

export type ScoreboardData = JTDDataType<typeof ScoreboardSchema>
const validate = ajv.compile<ScoreboardData>(ScoreboardSchema)


export function assertIsScoreboardData (
    data: unknown
): asserts data is ScoreboardData {
  if (!validate(data)) {
    if (validate.errors) {
      throw new Error(validate.errors.map(error => error.message).join(' '))
    }
    // console.dir(validate.errors)
    throw new Error('ESPN scoreboard data is not in expected format')
  }
}

