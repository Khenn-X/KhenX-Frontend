import React from 'react';
import { cn } from '../../lib/utils';
import type { NeighbourhoodIntelligenceSummary, IntelligenceCategory } from '../../types/intelligence.types';
import { INTELLIGENCE_CATEGORIES, STATUS_COLORS, CONFIDENCE_COLORS } from '../../types/intelligence.types';
import { IntelligenceBlockDisplay } from './IntelligenceBlockDisplay';

interface IntelligenceSummaryDisplayProps {
  summary: NeighbourhoodIntelligenceSummary;
  showOverall?: boolean;
  layout?: 'grid' | 'stacked';
}

// const iconMap: Record<string, string> = {
//   Zap: '⚡',
//   Droplets: '💧',
//   Shield: '🛡️',
//   Car: '🚗',
//   DollarSign: '💰',
// };

/**
 * Displays the complete neighbourhood intelligence summary.
 * Shows overall score, all available intelligence blocks, and description.
 */
export const IntelligenceSummaryDisplay = React.memo(function IntelligenceSummaryDisplay({
  summary,
  showOverall = true,
  layout = 'grid',
}: IntelligenceSummaryDisplayProps) {
  const overallStatusColors = summary.overallStatus ? STATUS_COLORS[summary.overallStatus] : null;
  const overallConfidenceColors = summary.overallConfidence ? CONFIDENCE_COLORS[summary.overallConfidence] : null;

  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return 'text-slate-400';
    if (score >= 8) return 'text-[#00C9A7]';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number | null | undefined): string => {
    if (score == null) return 'bg-slate-500/10';
    if (score >= 8) return 'bg-[#00C9A7]/10';
    if (score >= 6) return 'bg-blue-500/10';
    if (score >= 4) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const availableBlocks = INTELLIGENCE_CATEGORIES.filter(
    (cat) => (summary as Record<string, any>)[cat]
  ) as IntelligenceCategory[];

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      {showOverall && summary.overallScore !== null && overallStatusColors && (
        <div className="rounded-2xl border border-[#00C9A7]/20 bg-gradient-to-br from-[#00C9A7]/10 to-[#00C9A7]/5 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Overall Intelligence Rating
              </p>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed max-w-lg">
                {summary.description || 'Based on verified resident reports, property data, and local expertise.'}
              </p>
              <div className="flex items-center gap-3">
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border capitalize', overallStatusColors.bg, overallStatusColors.border, overallStatusColors.text)}>
                  {summary.overallStatus}
                </span>
                {overallConfidenceColors && (
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border capitalize', overallConfidenceColors.bg, overallConfidenceColors.border, overallConfidenceColors.text)}>
                    {summary.overallConfidence} confidence
                  </span>
                )}
              </div>
            </div>

            {/* Large Score Display */}
            <div className={cn('rounded-2xl p-6 flex items-center justify-center', getScoreBg(summary.overallScore))}>
              <div className="text-center">
                <div className={cn('text-4xl font-bold', getScoreColor(summary.overallScore))}>
                  {summary.overallScore != null ? summary.overallScore.toFixed(1) : 'N/A'}
                </div>
                <div className={cn('text-xs font-semibold mt-1', getScoreColor(summary.overallScore))}>
                  / 10
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {summary.description && !showOverall && (
        <p className="text-sm text-slate-300 leading-relaxed">{summary.description}</p>
      )}

      {/* Available Categories */}
      {availableBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">
            Neighbourhood Intelligence ({availableBlocks.length})
          </h3>
          <div className={cn(
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
              : 'space-y-4'
          )}>
            {availableBlocks.map((category) => {
              const block = (summary as Record<string, any>)[category];
              if (!block) return null;

              return (
                <div key={category} className={layout === 'grid' ? 'col-span-1' : ''}>
                  <IntelligenceBlockDisplay
                    category={category}
                    block={block}
                    compact={layout === 'grid'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Data State */}
      {availableBlocks.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-slate-400">
            No detailed intelligence available yet. Help by submitting a resident report.
          </p>
        </div>
      )}
    </div>
  );
});

IntelligenceSummaryDisplay.displayName = 'IntelligenceSummaryDisplay';
