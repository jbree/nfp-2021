import React from 'react'
import { TeamIcon } from './TeamIcon'
import { Team } from './queries/Teams'
import { Record } from './Record'
import './TeamRecordIcon.scss'

export interface TeamRecordIconProps {
  team: Team
}

export function TeamRecordIcon (props: TeamRecordIconProps): JSX.Element {
  return (
    <div className='team-record-icon'>
      <TeamIcon abbr={props.team.abbreviation} size={40} />
      <Record record={props.team.record} />
    </div>
  )
}
