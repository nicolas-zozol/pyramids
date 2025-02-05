import * as React from 'react';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';

import { getPostUrl } from '@/logic/routing/segments';
import { Post } from '@/logic/posts';

export interface Social {
  name: string;
  icon: any;
}
export interface Share {
  name: string;
  icon: any;
  link: string;
}

type TSocialMediaProps = {
  post: Post;
  className?: string;
};

export function SocialMedia({ post, className }: TSocialMediaProps) {
  return (
    <div className={className}>
      <h3 className={'text-center'}>Share this post</h3>
      <div className={'flex justify-center gap-10'}>
        <a href={`${twitterShareLink}${getPostUrl(post)}`}>{twitterSharePic}</a>
        <a href={`${linkedinShareLink}${getPostUrl(post)}`}>
          {linkedinSharePic}
        </a>
      </div>
    </div>
  );
}

function TwitterShare() {
  return (
    <span className={'article-social'}>
      <FaTwitter />
    </span>
  );
}

function LinkedinShare() {
  return (
    <span className={'article-social'}>
      <FaLinkedin />
    </span>
  );
}

function FacebookShare() {
  return (
    <span className={'article-social'}>
      <FaFacebook />
    </span>
  );
}
export const shares: Share[] = [
  {
    name: 'twitter',
    icon: <TwitterShare />,
    link: 'https://twitter.com/share?url=',
  },
  {
    name: 'linkedin',
    icon: <LinkedinShare />,
    link: 'https://www.linkedin.com/shareArticle?url=',
  },
  {
    name: 'facebook',
    icon: <FacebookShare />,
    link: 'https://www.facebook.com/sharer/sharer.php?u=',
  },
];

export const twitterSharePic = shares[0].icon;
export const linkedinSharePic = shares[1].icon;
export const facebookSharePic = shares[2].icon;

export const twitterShareLink = shares[0].link;
export const linkedinShareLink = shares[1].link;
export const facebookShareLink = shares[2].link;
