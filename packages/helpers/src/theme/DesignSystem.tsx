import React from 'react';

interface DesignSystemProps {
  className?: string;
}
export const DesignSystem: React.FC<DesignSystemProps> = ({ className }) => {
  return (
    <main className={className}>
      <section className={'bg-base-100'}>
        <h3 className={'text-base-content'}>Base content</h3>
        <div className={'text-base-content py-4'}>
          text-base-content on bg-base-100
        </div>
      </section>

      <section className={'bg-base-200 my-4'}>
        <h3 className={'text-base-content'}>Base content</h3>
        <div className={'text-base-content py-2'}>
          text-base-content on bg-base-200
        </div>
        <div className={'text-base-100 py-2'}>text-base-100 on bg-base-200</div>
        <div className={'text-base-200 py-2'}>text-base-200 on bg-base-200</div>
        <div className={'text-base-300 py-2'}>text-base-300 on bg-base-200</div>
      </section>

      <section className={'bg-base-300 my-4'}>
        <h3 className={'text-base-content'}>Base content</h3>
        <div className={'text-base-content py-2'}>
          text-base-content on bg-base-300
        </div>
      </section>

      <section className={''}>
        <h3>Colors - no text colors set</h3>

        <div className={'bg-primary text-primary-content'}>
          text-primary-content on bg-primary
          <div className={'text-accent'}>text accent</div>
        </div>

        <div className={'bg-secondary text-secondary-content'}>
          text-secondary-content on bg-secondary
        </div>

        <div className={'text-primary'}>###text-primary on bg-accent</div>

        <div className={'bg-neutral text-neutral-content'}>
          text-neutral-content on bg-neutral
        </div>

        <div className={'text-neutral-content bg-neutral-300'}>
          text-neutral-content on bg-neutral-300
        </div>

        <div>
          <button className={'btn btn-primary'}>Primary button</button>
        </div>
      </section>
    </main>
  );
};
