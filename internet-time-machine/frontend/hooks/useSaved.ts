import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { fetcher } from '@/lib/api'
import { SavedDomain } from '@/types/domain'

export function useSaved() {
  const { getToken, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  // Fetch Saved Domains
  const savedQuery = useQuery<{ saved: SavedDomain[] }>({
    queryKey: ['savedDomains'],
    queryFn: async () => {
      const token = await getToken();
      return fetcher<{ saved: SavedDomain[] }>('/api/v1/saved', {}, token);
    },
    enabled: !!isSignedIn
  })

  // Save Bookmark
  const saveMutation = useMutation({
    mutationFn: async ({ domain, personalNote }: { domain: string, personalNote?: string }) => {
      const token = await getToken();
      return fetcher<any>('/api/v1/saved', {
        method: 'POST',
        body: JSON.stringify({ domain, personal_note: personalNote })
      }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedDomains'] });
    }
  })

  // Delete Bookmark
  const deleteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const token = await getToken();
      return fetcher<void>(`/api/v1/saved/${domain}`, {
        method: 'DELETE'
      }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedDomains'] });
    }
  })

  // Update Bookmark Note
  const updateMutation = useMutation({
    mutationFn: async ({ domain, personalNote }: { domain: string, personalNote: string | null }) => {
      const token = await getToken();
      return fetcher<any>(`/api/v1/saved/${domain}`, {
        method: 'PATCH',
        body: JSON.stringify({ personal_note: personalNote })
      }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedDomains'] });
    }
  })

  return {
    savedQuery,
    saveMutation,
    deleteMutation,
    updateMutation
  }
}
export default useSaved;
