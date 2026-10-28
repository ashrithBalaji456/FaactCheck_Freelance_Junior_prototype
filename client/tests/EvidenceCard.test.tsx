import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvidenceCard } from '../src/components/evidence/EvidenceCard';
import { EvidenceItem } from '../src/types';

describe('EvidenceCard Component Tests', () => {
  const mockEvidence: EvidenceItem = {
    id: '65b1234567890abcdef12345',
    verificationId: '65b9999999999abcdef99999',
    title: 'The Constitution of India Official Gazetted Records',
    url: 'https://legislative.gov.in/constitution',
    sourceDomain: 'legislative.gov.in',
    snippet: 'Enacted and came into full legal effect on 26 January 1950.',
    publishedAt: '2023-01-26T00:00:00.000Z',
    retrievedAt: '2024-01-01T00:00:00.000Z',
    stance: 'SUPPORTS',
    relevanceScore: 0.95,
    sourceType: 'PRIMARY',
    contentAccessLevel: 'SEARCH_SNIPPET',
  };

  it('should render title and domain', () => {
    render(<EvidenceCard evidence={mockEvidence} />);
    expect(screen.getByText('The Constitution of India Official Gazetted Records')).toBeInTheDocument();
    expect(screen.getByText('legislative.gov.in')).toBeInTheDocument();
  });

  it('should render snippet and stance badge', () => {
    render(<EvidenceCard evidence={mockEvidence} />);
    expect(screen.getByText(/"Enacted and came into full legal effect on 26 January 1950."/)).toBeInTheDocument();
    expect(screen.getByText('SUPPORTS')).toBeInTheDocument();
  });

  it('should render safe external link with rel="noopener noreferrer"', () => {
    render(<EvidenceCard evidence={mockEvidence} />);
    const link = screen.getByRole('link', { name: /The Constitution of India/i });
    expect(link).toHaveAttribute('href', 'https://legislative.gov.in/constitution');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

