import React from 'react';
import { twCss, twCssAll } from '@robusta/pyramids-helpers';

const EffectsMap = {
  border:
    'transition-all duration-700 ease-in-out hover:ring-4 hover:ring-indigo-300',
  scale: 'transition-transform duration-700 ease-in-out hover:scale-105',
  reverse: 'transition-transform duration-700 ease-in-out hover:rotate-180',
  fadeUp:
    'transform transition-all duration-300 ease-in-out opacity-90 hover:-translate-y-1 hover:opacity-100',
  shadowPop: 'transition-shadow duration-700 ease-in-out hover:shadow-xl',
  reveal:
    'opacity-90 hover:opacity-100 transition-opacity duration-700 ease-in-out',
} as const;

type EffectKey = keyof typeof EffectsMap;

interface SimpleCardProps {
  children: string | React.ReactNode;
  className?: string;
  effect?: EffectKey;
  effects?: EffectKey[];
}

export const SimpleCardComponent: React.FC<SimpleCardProps> = ({
  children,
  className,
  effect,
  effects,
}) => {
  const finalEffects: EffectKey[] = [];

  if (effect) {
    finalEffects.push(effect);
  }

  if (effects) {
    finalEffects.push(...effects);
  }
  const effectClasses = finalEffects.map((key) => EffectsMap[key]).join(' ');

  //  const effectClass = effect ? EffectsMap[effect] : '';

  const classes = twCssAll(
    'h-full rounded-lg bg-white p-4 shadow-md',
    effectClasses,
    className,
  );

  //const classes = twCss('h-full rounded-lg bg-white p-4 shadow-md', className);
  return <div className={classes}>{children}</div>;
};
