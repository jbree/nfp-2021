declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NFP_SCOREBOARD_URI: string
      NFP_DRAFT_URI: string
      NFP_TEAMS_URI: string
      NFP_STALE_TIME: string
      NFP_TEAM_URI_PREFIX: string
      NFP_TEAM_URI_POSTFIX: string
    }
  }
}

export {}
