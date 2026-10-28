import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '../api/historyApi';
import { verificationApi } from '../api/verificationApi';

interface UseHistoryParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  verdictFilter?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useHistory({
  page = 1,
  limit = 10,
  searchQuery = '',
  verdictFilter = '',
  sort = 'createdAt',
  order = 'desc',
}: UseHistoryParams = {}) {
  const queryClient = useQueryClient();

  const queryKey = ['history', { page, limit, searchQuery, verdictFilter, sort, order }];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (searchQuery.trim()) {
        return historyApi.search(searchQuery.trim(), page, limit);
      }
      if (verdictFilter && verdictFilter !== 'ALL') {
        return historyApi.filterByVerdict(verdictFilter, page, limit);
      }
      return historyApi.list(page, limit, sort, order);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => verificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    ...query,
    deleteVerification: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

