import { ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import { twCss } from '@robusta/pyramids-helpers';

interface Props {
  images: StaticImageData[];
  title?: string;
  children?: ReactNode;
  className?: string;
}

export const PortfolioCollection = ({
  images,
  title,
  children,
  className,
}: Props) => {
  const classes = twCss('', className);

  return (
    <article className={classes}>
      {title && <h2 className="mb-4">{title}</h2>}

      <div className="flex flex-wrap gap-8">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative z-0 h-[300px] overflow-visible hover:z-10"
          >
            <Image
              key={idx}
              src={img}
              alt={`${title}-${idx}`}
              placeholder="blur"
              height={300}
              width={300} // Tailwind works better when width is also specified
              className="h-full w-full object-contain transition-transform duration-300 ease-in-out hover:scale-125"
            />
          </div>
        ))}
      </div>

      {/* Content (children) */}
      {children && <div className="mt-4">{children}</div>}
    </article>
  );
};
