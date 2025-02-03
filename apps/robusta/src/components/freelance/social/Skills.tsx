'use client';
import { FC, useEffect, useState } from 'react';
import { H2Title } from '@/components/title/H2Title';
import { useInView } from '@robusta/pyramids-helpers';

interface SkillCategoryProps {
  title: string;
  skills: string[];
}

const SkillCategory: FC<SkillCategoryProps> = ({ title, skills }) => {
  return (
    <div className="mt-4 flex flex-col lg:w-1/3">
      <div className="text-xl font-bold leading-8">{title}</div>
      <ul className="list-none pl-4 text-base">
        {skills.map((skill, idx) => (
          <li key={idx}>{skill}</li>
        ))}
      </ul>
    </div>
  );
};

export const Skills: FC<{}> = () => {
  const skillsData = [
    {
      title: 'Blockchain',
      skills: ['web3.js', 'ethers.js', 'Solidity', 'TheGraph'],
    },
    {
      title: 'Backend',
      skills: [
        'API design',
        'Java',
        'Spring',
        'Node JS',
        'SQL',
        'PHP/Symfony',
        'MongoDB',
      ],
    },
    {
      title: 'Frontend',
      skills: [
        'Typescript',
        'React JS',
        'Angular',
        'CSS/SASS',
        'Styled Component',
        'Responsive Design',
      ],
    },
    {
      title: 'Web marketing',
      skills: [
        'SEO 101 and more',
        'AIDA model',
        'Google analytics',
        'Segment',
        'MixPanel',
        'Personal library',
      ],
    },
  ];

  const { ref, isVisible } = useInView({ threshold: 1 });
  const [showClass, setShowClass] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowClass(isVisible);
    }, 300);
  }, [isVisible]);

  return (
    <div className={'my-20'}>
      <H2Title>Skills</H2Title>

      <div
        ref={ref}
        className={`transition-all duration-300 ${showClass ? 'opacity-100' : 'opacity-40'}`}
      >
        <div className="ml-5 flex flex-col lg:flex-row">
          {skillsData.map((category, idx) => (
            <SkillCategory
              key={idx}
              title={category.title}
              skills={category.skills}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
