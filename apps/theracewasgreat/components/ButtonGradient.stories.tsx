import type { Meta, StoryObj } from '@storybook/react';
import ButtonGradient from './ButtonGradient';

const meta = {
  title: 'Components/ButtonGradient',
  component: ButtonGradient,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGradient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Gradient Button',
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Custom Text',
  },
}; 