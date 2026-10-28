import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClaimForm } from '../src/components/verification/ClaimForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ClaimForm Component Tests', () => {
  it('should render claim input and submit button', () => {
    renderWithProviders(<ClaimForm />);
    expect(screen.getByPlaceholderText(/e\.g\. India's Constitution/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Claim with AI Agents/i })).toBeInTheDocument();
  });

  it('should populate claim when an example is clicked', () => {
    renderWithProviders(<ClaimForm />);
    const exampleButton = screen.getByText(/"India's Constitution came into effect on 26 January 1950."/i);
    fireEvent.click(exampleButton);

    const textarea = screen.getByPlaceholderText(/e\.g\. India's Constitution/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("India's Constitution came into effect on 26 January 1950.");
  });

  it('should prevent submission when claim is blank', () => {
    renderWithProviders(<ClaimForm />);
    const submitBtn = screen.getByRole('button', { name: /Verify Claim with AI Agents/i });
    expect(submitBtn).toBeDisabled();
  });
});
