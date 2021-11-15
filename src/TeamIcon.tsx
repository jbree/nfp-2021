import React from 'react'

interface TeamIconProps {
  abbr: string
  size: number
}

export function TeamIcon (props: TeamIconProps) {
  const img = `img/logo/${props.abbr}.svg`
  return (
    <img src={img} width={`${props.size}px` } />
  )
}
