import { MapPin, Clock, Database, Info } from 'lucide-react';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import ScoreBadge from './ScoreBadge';
import FloodRiskBadge from './FloodRiskBadge';
import { timeAgo, cn } from '../../lib/utils';

interface IntelligenceCardProps {
  data: INeighbourhoodIntelligence;
  className?: string;
}

const confidenceConfig = {
  low:    { label: 'Low confidence',    className: 'bg-red-100 text-red-600' },
  medium: { label: 'Medium confidence', className: 'bg-amber-100 text-amber-600' },
  high:   { label: 'High confidence',   className: 'bg-[#00C9A7]/10 text-[#00C9A7]' },
};

const IntelligenceCard = ({ data, className }: IntelligenceCardProps) => {
  const confidence = confidenceConfig[data.dataConfidence];
  const hasAnyScore =
    data.powerScore !== undefined ||
    data.floodRisk !== undefined ||
    data.securityScore !== undefined ||
    data.commuteScore !== undefined;

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm', className)}>

      {/* Header */}
      <div className="bg-[#0A1628] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-[#00C9A7]" />
              <h2 className="text-lg font-bold text-white">{data.areaName}</h2>
            </div>
            <p className="text-sm text-slate-400">Lagos, Nigeria</p>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold shrink-0', confidence.className)}>
            {confidence.label}
          </span>
        </div>
      </div>

      {/* Score grid */}
      <div className="px-6 py-6">
        {hasAnyScore ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ScoreBadge
              score={data.powerScore}
              label="Power Supply"
              size="lg"
            />
            <ScoreBadge
              score={data.securityScore}
              label="Security"
              size="lg"
            />
            <ScoreBadge
              score={data.commuteScore}
              label="Commute"
              size="lg"
            />
            {/* Flood risk takes the 4th slot */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-50 border-2 border-slate-200">
                <FloodRiskBadge
                  risk={data.floodRisk}
                  size="sm"
                  showLabel={false}
                  className="flex-col items-center"
                />
                <span className="mt-1 text-xs font-semibold text-slate-500 capitalize">
                  {data.floodRisk ?? '—'}
                </span>
              </div>
              <span className="text-sm text-center text-slate-600 font-medium">Flood Risk</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <Info className="h-8 w-8 text-slate-300" />
            <div>
              <p className="font-medium text-slate-600">Intelligence data coming soon</p>
              <p className="text-sm text-slate-400 mt-1">
                We're collecting verified data for {data.areaName}. Join the waitlist to be notified.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Flood risk detail */}
      {data.floodRisk && (
        <div className="border-t border-slate-100 px-6 py-4">
          <FloodRiskBadge risk={data.floodRisk} size="lg" />
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Intelligence notes
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{data.notes}</p>
        </div>
      )}

      {/* Footer metadata */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex flex-wrap items-center gap-4">
        {data.lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Updated {timeAgo(data.lastUpdated)}
          </div>
        )}
        {data.dataSources.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Database className="h-3.5 w-3.5" />
            Sources: {data.dataSources.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceCard;
