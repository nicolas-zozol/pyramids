import React, { FC } from 'react';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { SimpleLink } from '@robusta/pyramids-links';
import { TimeDiffered, twCss } from '@robusta/pyramids-helpers';
import Image from 'next/image';
import { FatLinkedIn } from '@robusta/pyramids-ctas';
import { H2Title } from '../title/H2Title';

const email = 'nicolas@robusta.build';
const imageUrl = '/images/nicolas-zozol-picture.jpg';

interface FreelanceAdProps {
  className?: string;
}
export const FreelanceAd: FC<FreelanceAdProps> = ({ className }) => (
  <section className={twCss('px-4 pt-10', className)}>
    <H2Title className={'mt-4'}>Experienced Fullstack freelance</H2Title>
    <div className={'text-base-content flex flex-wrap'}>
      <div className={'my-8 mr-8 max-w-2xl'}>
        <p>
          I am <strong>Nicolas Zozol</strong>, Freelance based in Toulouse,
          France. Do you need a A team contributor?
        </p>

        <ul className={'my-4 list-disc pl-5'}>
          <li>20+ years of experience, I started to code before Web tools</li>
          <li>
            <strong>Really fullstack</strong>, from pixel perfect CSS to
            docker-compose
          </li>
          <li>
            Specialist of EVM blockchains, including <strong>ethers.js</strong>{' '}
            and Solidity
          </li>
          <li>Scientific background, connecting dots of innovations</li>
        </ul>
        <br />
        <p>
          I am an <em>Oracle Master Java Certified</em> and
          <NeutralLink href={'https://www.toptal.com/resume/nicolas-zozol'}>
            {' '}
            screened by Toptal
          </NeutralLink>
          , the elite freelance agency. I worked with Big Companies like{' '}
          <NeutralLink href={'https://www.renault.com'}> Renault </NeutralLink>
          or{' '}
          <NeutralLink href={'https://www.bcg.com/'}>
            Boston Consulting Group
          </NeutralLink>
          , as well as many startups such as{' '}
          <NeutralLink href={'https://www.nauto.com/'}>Nauto</NeutralLink>,{' '}
          <NeutralLink href={'https://www.diool.com/'}>Diool</NeutralLink>,{' '}
          <NeutralLink href={'https://www.swaap.finance/'}>
            {' '}
            Swaap Finance
          </NeutralLink>
          .{/* CTA : Hire me on Toptal */}
        </p>
        <p>My goal is to turn your ideas into robust products !</p>

        <div>
          <EmptyLine size={4} />
          <FatLinkedIn center={true} />
        </div>

        {/* Social proofs: linkedin, Github, Stack Overflow */}
        {/* CTA : Contact-me on linkedIn, mail, etc...*/}
        {/* Put the CV right below with no mail/phone */}
      </div>

      <div className={'my-8 flex flex-col'}>
        <Image width={300} height={350} alt="avatar" src={imageUrl} />

        <TimeDiffered>
          <div className={'mt-4 flex gap-0.5'}>
            <img
              style={{
                marginRight: '10px',
                width: '20px',
                height: '12px',
                alignSelf: 'center',
              }}
              src="/images/email.png"
              alt={'mail'}
            />
            <a
              style={{
                alignSelf: 'center',
              }}
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </div>
          {/*
        <div style={{display: "flex", justifyContent: "center"}}>
            <TContactPhone
            icon={"images/smartphone.png"} text={nicolas.phone}/>
          </div>
        */}
        </TimeDiffered>
      </div>
    </div>
  </section>
);

interface NeutralLinkProps {
  href: string;
  children?: React.ReactNode;
}
const NeutralLink: React.FC<NeutralLinkProps> = ({
  children,
  href,
}: NeutralLinkProps) => (
  <SimpleLink href={href} className={'text-neutral'}>
    {children}
  </SimpleLink>
);
