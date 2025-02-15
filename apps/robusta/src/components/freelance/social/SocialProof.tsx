import { FC } from 'react';
import Image from 'next/image';
import stack from './images/stack-transparent.png';
import github from './images/github-transparent.png';
import bcg from './images/bcg.png';
import renault from './images/renault.png';
import oracle from './images/oracle.png';
import toptal from './images/toptal.png';
import GitHubCalendar from 'react-github-calendar';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { H2Title } from '@/components/title/H2Title';

export const SocialProof: FC<{}> = ({}) => {
  return (
    <div className="my-20">
      <H2Title>Social Proofs</H2Title>
      <section>
        {/* Social Icons */}
        <div className="flex items-center gap-10">
          <a href={'https://stackoverflow.com/users/968988/nicolas-zozol'}>
            <Image
              src={stack}
              alt={'stackoverflow'}
              placeholder={'blur'}
              className="h-auto w-full max-w-[200px] object-contain"
            />
          </a>
          <a href={'https://github.com/nicolas-zozol'}>
            <Image
              src={github}
              alt={'github'}
              placeholder={'blur'}
              className="h-auto w-full max-w-[200px] object-contain"
            />
          </a>
        </div>

        {/* GitHub Calendar */}
        <EmptyLine size={2} />

        <div>
          <GitHubCalendar username="nicolas-zozol" colorScheme={'light'} />
        </div>
        <h2>They worked with me</h2>

        {/* Enterprise Logos */}
        <div className="flex flex-wrap items-center justify-between gap-24">
          <a
            href={'https://www.toptal.com/resume/nicolas-zozol'}
            target={'_blank'}
            className="w-full max-w-[200px]"
          >
            <Image
              src={toptal}
              alt={'Toptal'}
              className="h-auto w-full max-w-[200px] object-contain"
            />
          </a>
          <Image
            src={bcg}
            alt={'bcg'}
            placeholder={'blur'}
            className="h-auto w-full max-w-[200px] object-contain"
          />
          <Image
            src={renault}
            alt={'renault'}
            placeholder={'blur'}
            className="h-auto w-full max-w-[200px] object-contain"
          />
          <Image
            src={oracle}
            alt={'oracle'}
            placeholder={'blur'}
            className="h-auto w-full max-w-[200px] object-contain"
          />
        </div>
      </section>
    </div>
  );
};
