export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

export function formatDuration(durationMs?: number | null): string {
  if (durationMs == null || durationMs <= 0) return '0.0s';
  return `${(durationMs / 1000).toFixed(1)}s`;
}

export function formatConfidence(score?: number | null): string {
  if (score == null) return 'N/A';
  return `${Math.round(score * 100)}%`;
}

