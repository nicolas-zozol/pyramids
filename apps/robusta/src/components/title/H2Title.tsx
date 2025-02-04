import { twCss } from '@robusta/pyramids-helpers';

interface H2TitleProps {
  children: React.ReactNode;
  className?: string;
}

export const H2Title: React.FC<H2TitleProps> = ({ children, className }) => {
  const classes = twCss(
    'font-alt little-bar text-primary text-4xl font-extrabold uppercase',
    className,
  );

  return <h2 className={classes}>{children}</h2>;
};
