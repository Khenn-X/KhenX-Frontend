import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const SUGGESTIONS = [
  'Find me a 2-bedroom flat in Lekki below ₦1.5m per year',
  'Self-contained apartment in Yaba with generator and internet',
  '3-bedroom duplex for sale in Ikeja with parking and security',
  'Short let apartment on the island under ₦50k per night',
  'Mini flat in Surulere with borehole, close to the market',
  '4-bedroom detached house in Magodo with a pool',
];

interface SearchSuggestionsProps {
  onSelect: (suggestion: string) => void;
  className?: string;
}

const SearchSuggestions = ({ onSelect, className }: SearchSuggestionsProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
        <Sparkles className="h-3 w-3" />
        Try asking
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;
