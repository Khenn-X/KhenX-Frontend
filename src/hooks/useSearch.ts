import { useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import { useSearchStore } from '../store/search.store';

export const useNaturalSearch = () => {
  const { setResults, setIsSearching } = useSearchStore();

  return useMutation({
    mutationFn: (query: string) => searchApi.naturalSearch({ query }),
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
};
