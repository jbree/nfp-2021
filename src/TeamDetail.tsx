import React from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import ordinal from 'ordinal'

import { Draft, fetchDraft } from './queries/Draft'
import { TeamDetails, fetchTeamDetails } from './queries/TeamDetails'

interface TeamParams {
  team: string
}

export function TeamDetail (): JSX.Element {
  const { team } = useParams<TeamParams>()

  const { data: draft, status: draftStatus } = useQuery<Draft>('draft', () => fetchDraft())
  const { data: details, status: detailsStatus } = useQuery<TeamDetails>(['teams', team], () => fetchTeamDetails(team, draft), { staleTime: 60000, enabled: !!draft })

  const status = [draftStatus, detailsStatus]


  if (status.find(s => s === 'loading')) {
    return <div>Loading...</div>
  }

  if (status.find(s => s === 'error') || !draft || !details) {
    return <div>Error loading data</div>
  }

  const round = details.draft.round

  return <>
    <h2 key='team'>{ details.location } { details.name }</h2>
    <p>{details.draft.owner}'s Round {round} Pick ({ordinal(details.draft.overall)} overall)</p>
    <p>{details.standingSummary}</p>
  </>
}
