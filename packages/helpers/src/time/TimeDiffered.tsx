'use client'
import React from 'react'
import { FC, ReactNode, useEffect, useState } from 'react'

interface Props {
  time?: number
  children: ReactNode
}

/**
 * Display a text after a small timeout to avoid being referenced by google and avoid dummy bots
 * Nicolas Zozol - https://www.robusta.build
 */
export const TimeDiffered: FC<Props> = ({ time = 400, children }) => {
  const [node, setNode] = useState<ReactNode>('')
  useEffect(() => {
    setTimeout(() => setNode(children), time)
  }, [children, time])
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `<!--googleoff: all-->` }} />
      {node}
      <script dangerouslySetInnerHTML={{ __html: `<!--googleon: all-->` }} />
    </>
  )
}
