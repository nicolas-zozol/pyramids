import { FC } from 'react';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { SimpleLink } from '@robusta/pyramids-links';
import { TimeDiffered } from '@robusta/pyramids-helpers';
import { FatCta } from '@robusta/pyramids-ctas';
import Image from 'next/image';

const email = 'nicolas@robusta.build';
const imageUrl = '/images/nicolas-zozol-picture.jpg';

export const About: FC<{}> = ({}) => (
  <section className={'my-10 px-4'}>
    <h1>Experienced Fullstack freelance</h1>
    <div className={'flex flex-wrap'}>
      <div className={'my-4 mr-8 max-w-2xl'}>
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
          <SimpleLink href={'https://www.toptal.com/resume/nicolas-zozol'}>
            {' '}
            screened by Toptal
          </SimpleLink>
          , the elite freelance agency. I worked with Big Companies like{' '}
          <SimpleLink href={'https://www.renault.com'}> Renault </SimpleLink>
          or{' '}
          <SimpleLink href={'https://www.bcg.com/'}>
            Boston Consulting Group
          </SimpleLink>
          , as well as many startups such as{' '}
          <SimpleLink href={'https://www.nauto.com/'}>Nauto</SimpleLink>,{' '}
          <SimpleLink href={'https://www.diool.com/'}>Diool</SimpleLink>,{' '}
          <SimpleLink href={'https://www.swaap.finance/'}>
            {' '}
            Swaap Finance
          </SimpleLink>
          .{/* CTA : Hire me on Toptal */}
        </p>
        <p>My goal is to turn your ideas into robust products !</p>

        <div>
          <EmptyLine size={4} />
          <FatCta center={true} />
        </div>

        {/* Social proofs: linkedin, Github, Stack Overflow */}
        {/* CTA : Contact-me on linkedIn, mail, etc...*/}
        {/* Put the CV right below with no mail/phone */}
      </div>

      <div className={'flex flex-col'}>
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
    <div>
      <EmptyLine size={2} />
    </div>
  </section>
);
