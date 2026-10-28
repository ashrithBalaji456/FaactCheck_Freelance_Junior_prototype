import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerdictBadge, StanceBadge } from '../src/components/common/Badge';

describe('VerdictBadge Component Tests', () => {
  it('should render TRUE verdict correctly', () => {
    render(<VerdictBadge verdict="TRUE" />);
    expect(screen.getByText('✓ TRUE')).toBeInTheDocument();
  });

  it('should render FALSE verdict correctly', () => {
    render(<VerdictBadge verdict="FALSE" />);
    expect(screen.getByText('✕ FALSE')).toBeInTheDocument();
  });

  it('should render PARTIALLY_TRUE verdict correctly', () => {
    render(<VerdictBadge verdict="PARTIALLY_TRUE" />);
    expect(screen.getByText('⚠ PARTIALLY TRUE')).toBeInTheDocument();
  });

  it('should render UNCERTAIN verdict correctly', () => {
    render(<VerdictBadge verdict="UNCERTAIN" />);
    expect(screen.getByText('? UNCERTAIN')).toBeInTheDocument();
  });

  it('should render PENDING when verdict is null', () => {
    render(<VerdictBadge verdict={null} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });
});

describe('StanceBadge Component Tests', () => {
  it('should render SUPPORTS, CONTRADICTS, and CONTEXT stances', () => {
    const { rerender } = render(<StanceBadge stance="SUPPORTS" />);
    expect(screen.getByText('SUPPORTS')).toBeInTheDocument();

    rerender(<StanceBadge stance="CONTRADICTS" />);
    expect(screen.getByText('CONTRADICTS')).toBeInTheDocument();

    rerender(<StanceBadge stance="CONTEXT" />);
    expect(screen.getByText('CONTEXT')).toBeInTheDocument();
  });
});

