declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NFP_SCOREBOARD_URI: string
      NFP_DRAFT_URI: string
      NFP_TEAMS_URI: string
      NFP_STALE_TIME: string
    }
  }
}

export {}