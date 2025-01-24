import { FC } from 'react';
import { TimeDiffered } from '@robusta/pyramids-helpers';
import { FaDownload } from 'react-icons/fa';

export const WebResume: FC<{}> = ({}) => {
  return (
    <div>
      {/* Web Section */}
      <section className="show-cv-web mt-40 hidden pt-40 md:block">
        <h2>Curriculum Vitae</h2>
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
      <section className="show-cv-pdf mt-40 flex flex-wrap gap-16 pt-40">
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
