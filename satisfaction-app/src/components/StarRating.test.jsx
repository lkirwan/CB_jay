import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('calls onChange with clicked star when interactive', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '4 stars' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables all buttons in read only mode', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }

    fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

