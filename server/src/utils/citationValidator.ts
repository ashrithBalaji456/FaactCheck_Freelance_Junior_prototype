export interface CitationValidationResult {
  validIds: string[];
  invalidIds: string[];
  isValid: boolean;
}

export function isValidCitationId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-f0-9]{24}$/i.test(id) || /^[0-9a-fA-F-]{36}$/.test(id);
}

export function validateCitationIds(
  citedIds: (string | unknown)[],
  availableEvidenceIds: (string | unknown)[]
): CitationValidationResult {
  const availableSet = new Set(
    availableEvidenceIds.map((id) => (id ? String(id) : ''))
  );

  const validIds: string[] = [];
  const invalidIds: string[] = [];

  for (const rawId of citedIds) {
    const idStr = rawId ? String(rawId).trim() : '';
    if (isValidCitationId(idStr) && availableSet.has(idStr)) {
      validIds.push(idStr);
    } else {
      invalidIds.push(idStr);
    }
  }

  // Deduplicate valid IDs while preserving order
  const uniqueValidIds = Array.from(new Set(validIds));

  return {
    validIds: uniqueValidIds,
    invalidIds,
    isValid: invalidIds.length === 0,
  };
}
