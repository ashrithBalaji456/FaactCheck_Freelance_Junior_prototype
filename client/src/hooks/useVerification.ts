import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi, SubmitVerificationPayload } from '../api/verificationApi';
import { VerificationDetail } from '../types';

export function useVerification(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<VerificationDetail>({
    queryKey: ['verification', id],
    queryFn: () => verificationApi.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'COMPLETED' || data.status === 'FAILED')) {
        return false;
      }
      return 3000; // Poll periodically as fallback if SSE is momentarily reconnecting
    },
  });

  const refetch = () => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['verification', id] });
    }
  };

  return {
    ...query,
    refetchVerification: refetch,
  };
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitVerificationPayload) =>
      verificationApi.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

