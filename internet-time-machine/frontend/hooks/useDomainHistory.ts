import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import { DomainMetadata } from '@/types/domain'

export function useDomainHistory(domain: string) {
  return useQuery<DomainMetadata>({
    queryKey: ['domainHistory', domain],
    queryFn: () => fetcher<DomainMetadata>(`/api/v1/domain/${domain}`),
    enabled: !!domain,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  })
}
export default useDomainHistory;
