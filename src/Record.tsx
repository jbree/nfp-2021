import React from 'react'
import { TeamRecord } from './queries/Teams'

interface RecordProps {
  record: TeamRecord
}

export function Record (props: RecordProps): JSX.Element {
  const r = props.record
  return (
    <>
      {r.wins} – {r.losses}{r.ties ? ` – ${r.ties}` : ''}
    </>
  )
}
