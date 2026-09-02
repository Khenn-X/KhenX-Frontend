import { useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import { useSearchStore } from '../store/search.store';
import type { NaturalSearchPayload } from '../types/search.types';

export const useNaturalSearch = () => {
  const { setResults, setIsSearching, setQuery, setSearchError } = useSearchStore();

  const mutation = useMutation({
    mutationFn: (payload: NaturalSearchPayload) => searchApi.naturalSearch(payload),
    onMutate: (variables) => {
      setQuery(variables.query);
      setIsSearching(true);
      setSearchError(null);
    },
    onSuccess: (res) => {
      console.log('[DIAG] onSuccess res:', res);
      console.log('[DIAG] res.data.listings:', res.data.listings);
      const filterChips = res.data.filterChips ?? [];
      setResults(res.data.listings, res.data.interpretedQuery, filterChips);
      console.log('[DIAG] store after setResults:', useSearchStore.getState().results);
      setIsSearching(false);
    },
    onError: (error: any) => {
      setIsSearching(false);
      const errorMessage = error?.message || 'Search failed. Please try again.';
      setSearchError(errorMessage);
    },
  });

  return {
    ...mutation,
    doSearch: (payload: NaturalSearchPayload) => mutation.mutate(payload),
  };
};
