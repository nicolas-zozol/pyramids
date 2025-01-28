import * as React from 'react';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';

import article from '../../styles/components/article.module.scss';
import { getPostUrl } from '@/logic/url';
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
      <div className={'justify-center'}>
        <a
          className={'!m-5 w-[60px]'}
          href={`${twitterShareLink}${getPostUrl(post)}`}
        >
          {twitterSharePic}
        </a>
        <a
          className={'!m-5 w-[60px]'}
          href={`${linkedinShareLink}${getPostUrl(post)}`}
        >
          {linkedinSharePic}
        </a>
      </div>
    </div>
  );
}

function TwitterShare() {
  return (
    <span>
      <FaTwitter />
    </span>
  );
}

function LinkedinShare() {
  return (
    <span>
      <FaLinkedin />
    </span>
  );
}

function FacebookShare() {
  return (
    <span>
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
