import { apiClient } from './client';
import { VerificationSummary, PaginationMeta } from '../types';

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export const historyApi = {
  list: async (page = 1, limit = 10, sort = 'createdAt', order = 'desc') => {
    const raw = await apiClient<any>(
      `/verifications?page=${page}&limit=${limit}&sort=${sort}&order=${order}`
    );
    return {
      items: (raw.data || raw) as VerificationSummary[],
      pagination: raw.pagination as PaginationMeta,
    };
  },

  search: async (query: string, page = 1, limit = 10) => {
    const raw = await apiClient<any>(
      `/verifications/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return {
      items: (raw.data || raw) as VerificationSummary[],
      pagination: raw.pagination as PaginationMeta,
    };
  },

  filterByVerdict: async (verdict: string, page = 1, limit = 10) => {
    const raw = await apiClient<any>(
      `/verifications/verdict/${verdict}?page=${page}&limit=${limit}`
    );
    return {
      items: (raw.data || raw) as VerificationSummary[],
      pagination: raw.pagination as PaginationMeta,
    };
  },
};

