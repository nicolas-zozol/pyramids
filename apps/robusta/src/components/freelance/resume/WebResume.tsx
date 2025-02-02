import { FC } from 'react';
import { TimeDiffered, twCss } from '@robusta/pyramids-helpers';
import { FaDownload } from 'react-icons/fa';
import { H2Title } from '@/components/title/H2Title';

interface WebResumeProps {
  className?: string;
}
export const WebResume: FC<WebResumeProps> = ({ className }) => {
  const classes = twCss('', className);
  return (
    <div className={classes}>
      {/* Web Section */}
      <section className="show-cv-web">
        <H2Title>Curriculum Vitae</H2Title>
        <TimeDiffered time={300}>
          <iframe
            src={'/nicolas/resume-web-crypto.html'}
            width={'100%'}
            height={'2100px'}
            className={'border-inset border-2 border-gray-400 p-4'}
          ></iframe>
        </TimeDiffered>
      </section>

      {/* PDF Section */}
      <section className="show-cv-pdf my-10 flex flex-wrap gap-16">
        <a
          target={'_blank'}
          href={'/nicolas/nicolas-zozol-web3-resume.pdf'}
          className="flex text-xl text-blue-600 hover:underline"
        >
          <FaDownload className="mr-2" />
          Download Nicolas's CV
        </a>

        <a
          target={'_blank'}
          href={'/nicolas/nicolas-zozol-portfolio.pdf'}
          className="flex text-xl text-blue-600 hover:underline"
        >
          <FaDownload className="mr-2" />
          Download Nicolas's Portfolio
        </a>
      </section>
    </div>
  );
};
