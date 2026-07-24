import { useState, useRef, KeyboardEvent } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';
import { useNaturalSearch } from '../../hooks/useSearch';
import { useSearchStore } from '../../store/search.store';
import SearchSuggestions from './SearchSuggestions';
import { cn } from '../../lib/utils';

interface NaturalSearchBarProps {
  size?: 'default' | 'large';
  showSuggestions?: boolean;
  placeholder?: string;
  className?: string;
  onSearchComplete?: () => void;
}

const NaturalSearchBar = ({
  size = 'default',
  showSuggestions = true,
  placeholder = 'Find me a 2-bedroom flat in Lekki below ₦1m...',
  className,
  onSearchComplete,
}: NaturalSearchBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: search, isPending } = useNaturalSearch();
  const { isSearching, clearSearch } = useSearchStore();

  const isLoading = isPending || isSearching;

  const handleSearch = () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;

    search(query, {
      onSuccess: () => {
        setShowHints(false);
        onSearchComplete?.();
      },
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setShowHints(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setShowHints(false);
    // Auto-trigger search after suggestion selection
    setTimeout(() => {
      search(suggestion, {
        onSuccess: () => onSearchComplete?.(),
      });
    }, 50);
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search input */}
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-2xl bg-white shadow-lg border border-slate-200 transition-shadow focus-within:shadow-xl focus-within:border-[#00C9A7]/40',
          size === 'large' ? 'px-5 py-4' : 'px-4 py-3'
        )}
      >
        {/* AI sparkle icon */}
        <div className="shrink-0">
          {isLoading ? (
            <Loader2
              className={cn(
                'animate-spin text-[#00C9A7]',
                size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
              )}
            />
          ) : (
            <Sparkles
              className={cn(
                'text-[#00C9A7]',
                size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
              )}
            />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowHints(e.target.value.length === 0);
          }}
          onFocus={() => { if (!inputValue) setShowHints(true); }}
          onBlur={() => setTimeout(() => setShowHints(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent text-[#0F172A] placeholder:text-slate-400 focus:outline-none',
            size === 'large' ? 'text-base' : 'text-sm'
          )}
          aria-label="Search properties using natural language"
        />

        {/* Clear */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!inputValue.trim() || isLoading}
          className={cn(
            'shrink-0 flex items-center gap-1.5 rounded-xl bg-[#00C9A7] font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            size === 'large' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
          )}
        >
          <Search className="h-3.5 w-3.5" />
          {size === 'large' ? 'Search' : 'Go'}
        </button>
      </div>

      {/* AI label */}
      <div className="mt-2 flex items-center gap-1.5 px-1">
        <span className="rounded-full bg-[#00C9A7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00C9A7] uppercase tracking-wide">
          AI-powered
        </span>
        <span className="text-xs text-slate-400">
          Describe what you want in plain English — we'll handle the rest.
        </span>
      </div>

      {/* Suggestions dropdown */}
{showSuggestions && showHints && (
  <div className="absolute left-0 right-0 top-full mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg z-20">
    <SearchSuggestions onSelect={handleSuggestionSelect} />
  </div>
)}
    </div>
  );
};

export default NaturalSearchBar;
