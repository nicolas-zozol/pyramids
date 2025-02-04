const fakeUsers = [
  'Kevin',
  'Julien',
  'Jane',
  'Jacob',
  'Josh',
  'Jo Foo',
  'Jo Bar',
  'Jason',
  'Brian',
  'P@ul',
  'Peter',
  'Mick',
  'Joe',
  'Jim',
]

export async function getFakeUsers(matchString: string) {
  return fakeUsers.filter(user =>
    user.toLowerCase().startsWith(matchString.toLowerCase())
  )
}

const fakeHashtags = [
  'Re@ct',
  'Vue',
  'Ang#lar',
  'svelte',
  'node',
  'Nodejs',
  'Express',
  'Next',
  'Nuxt',
  'Gatsby',
  'Sapper',
  'Redux',
  'MobX',
  'GraphQL',
  'Apollo',
  'REST',
]

export async function getFakeHashtags(matchString: string) {
  return fakeHashtags.filter(tag =>
    tag.toLowerCase().startsWith(matchString.toLowerCase())
  )
}

const fakeFlows = [
  'A fit body, a calm mind, a house full of love',
  'Information is everywhere ',
  'The only way to get smarter is by playing a smarter opponent',
  'Sophisticated foods are bittersweet',
  'Success is the enemy of learning',
  'This is such a short and precious life',
]

export async function getFakeFlows(matchString: string) {
  return fakeFlows.filter(flow =>
    flow.toLowerCase().startsWith(matchString.toLowerCase())
  )
}
