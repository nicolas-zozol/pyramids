import {Post} from './posts'

export function getThumbnail(post:Post):string{

  if(!post.image){
    throw 'no image for post : '+post.title
  }
  const file = post.image.slice(post.image.lastIndexOf('/') + 1)
  if (!file){
    throw `no image file found for post ${post.title} (${post.image.lastIndexOf('/')})`
  }

  return `/thumbnails/${file}`

}