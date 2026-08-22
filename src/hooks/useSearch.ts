import { useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import { useSearchStore } from '../store/search.store';
import type { NaturalSearchPayload } from '../types/search.types';

export const useNaturalSearch = () => {
  const { setResults, setIsSearching } = useSearchStore();

  const mutation = useMutation({
    mutationFn: (payload: NaturalSearchPayload) => searchApi.naturalSearch(payload),
    onMutate: () => {
      setIsSearching(true);
    },
    onSuccess: (res) => {
      setResults(res.data.listings, res.data.interpretedQuery);
      setIsSearching(false);
    },
    onError: () => {
      setIsSearching(false);
    },
  });

  return {
    ...mutation,
    doSearch: (payload: NaturalSearchPayload) => mutation.mutate(payload),
  };
};
