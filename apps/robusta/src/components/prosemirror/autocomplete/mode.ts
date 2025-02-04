import { Schema } from 'prosemirror-model'
import { Mode } from 'node:fs'
import { getFakeFlows, getFakeHashtags, getFakeUsers } from './fake-data'

export type MODE = 'PEOPLE' | 'HASHTAG' | 'FLOW'

export function getSchemaTypeByMode(schema: Schema, mode: MODE) {
  switch (mode) {
    case 'PEOPLE':
      return schema.nodes.people
    case 'HASHTAG':
      return schema.nodes.hashtag
    case 'FLOW':
      return schema.nodes.flow
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}

type Faker = (matchString: string) => Promise<string[]>
export function getFakerByMode(mode: Mode): Faker {
  switch (mode) {
    case 'PEOPLE':
      return getFakeUsers
    case 'HASHTAG':
      return getFakeHashtags
    case 'FLOW':
      return getFakeFlows
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}
