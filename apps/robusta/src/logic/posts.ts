import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { slugify } from './slugify'

// TODO: some or all are mandatory
// frontMatter should have not mandatories, and we should create post from frontmatter
export interface PostFrontMatter {
  date: string
  modified?: string
  title: string
  category: string
  tags: string[]
  lang: 'en' | 'fr'
  image: string
  slug?: string
  excerpt: string
  author?: string
  enVersion?: string
  frVersion?: string
  featured?: boolean
  keywords: string[]
}

export interface Post {
  date: string
  modified?: string
  title: string
  category: string
  tags: string[]
  lang: 'en' | 'fr'
  image: string
  slug: string
  excerpt: string
  author: string
  enVersion?: string
  frVersion?: string
  featured: boolean
  content: string
  keywords: string[]
}

export interface RollContext {
  currentPage: number
  numberOfPages: number
  rollSize: number
  roll: Post[]
}

export interface PostMetaData {
  id: string
}

function traverseDir(dir: string, action: (path: string) => void) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath, action)
    } else {
      action(fullPath)
    }
  })
}

// should be renamed as createPost or hydratePost, with validation
function validateFrontMatter(
  frontMatter: Partial<PostFrontMatter>,
  path: string
) {
  if (!frontMatter.date) {
    throw 'No date: ' + path
  }

  if (frontMatter.date.length !== 10) {
    throw `Wrong date format:${frontMatter.date} ` + path
  }
  if (!frontMatter.title) {
    throw 'No title: ' + path
  }
  if (!frontMatter.category) {
    throw 'No category: ' + path
  }
  if (!path.includes(frontMatter.category)) {
    throw `Wrong category ${frontMatter.category} from path: ${path}`
  }
  if (!frontMatter.tags) {
    throw 'No tags: ' + path
  }
  if (!frontMatter.lang) {
    frontMatter.lang = 'en'
  }
  if (!frontMatter.image) {
    throw 'No image: ' + path
  } else {
    let path = frontMatter.image
    if (path.startsWith('./')) {
      path = path.slice(2)
    }
    if (path.startsWith('images')) {
      path = path.slice('images'.length)
    }
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    console.log(frontMatter.image, path)
    frontMatter.image = path
  }
  if (!frontMatter.featured) {
    frontMatter.featured = false
  }
  if (!frontMatter.slug) {
    frontMatter.slug = slugify(frontMatter.title)
  }
  if (!frontMatter.keywords) {
    frontMatter.keywords = [
      'robusta build',
      'nicolas zozol',
      'tutorial',
      ...frontMatter.tags,
    ]
  } else {
    frontMatter.keywords = [
      ...frontMatter.keywords,
      'robusta build',
      'nicolas zozol',
    ]
  }
}

const posts: Post[] = []
let postsGenerated = false

export async function getSortedPostsData(): Promise<Post[]> {
  // Get file names under /posts
  //const skipPrism = process.env.SKIP_PRISM === 'true'
  // console.log({skipPrism})
  const pendings: Promise<any>[] = []
  if (postsGenerated) {
    console.log('+++++ Using cache ')
    return sortPostsByDate(posts)
  } else {
    console.log('==== Calculating all')
    postsGenerated = true
  }
  let i = 0
  traverseDir('content/blog', path => {
    if (path.includes('.md')) {
      const fileContents = fs.readFileSync(path, 'utf8')

      // Use gray-matter to parse the post metadata section

      const matterResult = matter(fileContents, {
        excerpt: true,
      })
      const frontMatter: PostFrontMatter = matterResult.data as PostFrontMatter
      validateFrontMatter(frontMatter, path)
      if (!matterResult.excerpt) {
        throw 'No excerpt: ' + path
      }
      frontMatter.excerpt = matterResult.excerpt

      let parser = remark().use(html)

      const processedContentPromise = parser.process(matterResult.content)
      pendings.push(processedContentPromise)

      processedContentPromise.then(content => {
        const contentHtml = content.toString()
        const newPost: Post = {
          slug: slugify(matterResult.data.title),
          content: contentHtml,
          ...frontMatter,
        } as Post
        newPost.content = contentHtml
        posts.push(newPost)
      })

      i++
    }
  })

  await Promise.all(pendings)
  // Sort posts by date
  console.log('blog size :', posts.length)
  return sortPostsByDate(posts)
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort(({ date: a }, { date: b }) => (a < b ? 1 : -1))
}
