import React from 'react';
// import { LucideIcon, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IntelligenceBlock, IntelligenceCategory } from '../../types/intelligence.types';
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_COLORS, CONFIDENCE_COLORS } from '../../types/intelligence.types';

// Dynamically import lucide icons
const iconMap: Record<string, React.ReactNode> = {
  Zap: '⚡',
  Droplets: '💧',
  Shield: '🛡️',
  Car: '🚗',
  DollarSign: '💰',
  BookOpen: '📚',
  CreditCard: '💳',
  ShoppingCart: '🛍️',
  Train: '🚆',
  Heart: '❤️',
  Users: '👥',
};

interface IntelligenceBlockDisplayProps {
  category: IntelligenceCategory;
  block: IntelligenceBlock;
  compact?: boolean; // condensed view for cards
}

/**
 * Displays a single intelligence block with score, status, confidence, summary and evidence.
 * Used in both chat and neighbourhood detail pages.
 */
export const IntelligenceBlockDisplay = React.memo(function IntelligenceBlockDisplay({
  category,
  block,
  compact = false,
}: IntelligenceBlockDisplayProps) {
  const categoryLabel = CATEGORY_LABELS[category];
  const iconEmoji = iconMap[CATEGORY_ICONS[category]];
  const statusColors = STATUS_COLORS[block.status];
  const confidenceColors = CONFIDENCE_COLORS[block.confidence];

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

  if (compact) {
    // Compact card-style display for grids
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-[#00C9A7]/30 hover:bg-white/8 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{iconEmoji}</span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{categoryLabel}</span>
        </div>

        {block.score != null && (
          <div className={cn('inline-flex items-center gap-1 rounded px-2 py-1 mb-2 text-sm font-bold', getScoreBg(block.score), getScoreColor(block.score))}>
            {block.score.toFixed(1)}/10
          </div>
        )}

        <p className="text-xs text-slate-300 line-clamp-2 mb-2">{block.summary}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border', statusColors.bg, statusColors.border, statusColors.text)}>
            {block.status}
          </span>
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize', confidenceColors.bg, confidenceColors.border, confidenceColors.text)}>
            {block.confidence} confidence
          </span>
        </div>
      </div>
    );
  }

  // Full display
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconEmoji}</span>
          <h3 className="text-lg font-bold text-white">{categoryLabel}</h3>
        </div>
        <span className={cn('text-xs font-semibold px-3 py-1 rounded-full border capitalize', confidenceColors.bg, confidenceColors.border, confidenceColors.text)}>
          {block.confidence} confidence
        </span>
      </div>

      {/* Score & Status Row */}
      <div className="flex items-center gap-4 mb-4">
        {block.score != null && (
          <div className={cn('rounded-lg p-3', getScoreBg(block.score))}>
            <div className={cn('text-2xl font-bold', getScoreColor(block.score))}>
              {block.score.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">out of 10</div>
          </div>
        )}

        <div className={cn('rounded-lg border px-4 py-3 flex-1', statusColors.bg, statusColors.border)}>
          <div className={cn('text-sm font-bold', statusColors.text)}>
            {block.status}
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-300 mb-5 leading-relaxed">{block.summary}</p>

      {/* Evidence / Details */}
      {block.evidence && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Supporting Data</h4>

          <div className="space-y-2 text-xs text-slate-400">
            {block.evidence.dataConfidence && (
              <div className="flex items-center justify-between">
                <span>Data Quality:</span>
                <span className="capitalize font-medium text-slate-300">{block.evidence.dataConfidence}</span>
              </div>
            )}

            {block.evidence.totalReportsUsed != null && (
              <div className="flex items-center justify-between">
                <span>Based on Reports:</span>
                <span className="font-medium text-slate-300">{block.evidence.totalReportsUsed}</span>
              </div>
            )}

            {block.evidence.lastUpdated && (
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="font-medium text-slate-300">
                  {new Date(block.evidence.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}

            {block.evidence.dataSources && block.evidence.dataSources.length > 0 && (
              <div className="flex items-start justify-between">
                <span>Sources:</span>
                <div className="text-right">
                  {block.evidence.dataSources.map((source, i) => (
                    <div key={i} className="text-slate-300">{source}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional metadata from extra fields */}
          {Object.entries(block).map(([key, value]) => {
            if (['score', 'status', 'confidence', 'summary', 'evidence'].includes(key)) return null;
            if (typeof value === 'object' || !value) return null;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key}:</span>
                <span className="font-medium text-slate-300">
                  {typeof value === 'number' ? value.toFixed(1) : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

IntelligenceBlockDisplay.displayName = 'IntelligenceBlockDisplay';
