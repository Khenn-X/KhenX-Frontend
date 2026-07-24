import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import { ROUTES } from '../../constants/routes';

const getScoreBadgeClasses = (score?: number | null) => {
  if (score == null) return 'bg-slate-100 text-slate-500';
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
  if (score >= 6) return 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200';
  if (score >= 4) return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
  return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
};

const getFloodBadgeClasses = (risk?: string | null) => {
  if (!risk) return 'bg-slate-100 text-slate-500';
  const normalized = risk.toLowerCase();
  if (normalized === 'low') return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
  if (normalized === 'medium') return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
  return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
};

const renderField = (label: string, value: string | number | boolean | null | undefined) => (
  <div className="grid gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-sm font-medium text-[#0F172A]">
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </span>
  </div>
);

const renderScoreField = (label: string, value: number | null | undefined) => (
  <div className="grid gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className={`inline-flex w-fit min-w-[2.5rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClasses(value)}`}>
      {value ?? '—'}
    </span>
  </div>
);

const renderFloodField = (label: string, value: string | null | undefined) => (
  <div className="grid gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getFloodBadgeClasses(value)}`}>
      {value ?? '—'}
    </span>
  </div>
);

const renderObjectFields = (title: string, objectValue: Record<string, unknown> | undefined) => {
  if (!objectValue) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(objectValue).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{key}</span>
            <div className="mt-1 text-sm font-medium text-[#0F172A]">
              {value === null || value === undefined || value === '' ? '—' : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderImageField = (label: string, url: string | null | undefined) => (
  <div className="space-y-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    {url ? (
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <img
          src={url}
          alt={label}
          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    ) : (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
        No image
      </div>
    )}
  </div>
);

const AdminNeighbourhoodViewPage = () => {
  const { areaName } = useParams<{ areaName: string }>();
  const { data, isLoading, isError, refetch } = useAllAreas();
  const areas = useMemo(() => data?.data?.areas ?? [], [data]);
  const navigate = useNavigate();

  const neighbourhood = useMemo(
    () => areas.find((area) => area.areaName === areaName),
    [areas, areaName],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Read only
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">View Neighbourhood</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Review neighbourhood intelligence data in a read-only format.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOODS)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 5 6 10l6 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to list
          </button>
          {areaName && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOOD_EDIT(areaName))}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C9A7] px-5 py-2.5 text-sm font-semibold text-[#0A1628] shadow-sm shadow-[#00C9A7]/30 transition-colors hover:bg-[#00E0BA]"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M13.5 3.5a2 2 0 0 1 2.83 2.83L6.5 16.17 3 17l.83-3.5L13.5 3.5Z" strokeLinejoin="round" />
              </svg>
              Edit this neighbourhood
            </button>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading neighbourhood metadata..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {!neighbourhood ? (
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
              Neighbourhood not found. Please return to the list and select a valid area.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* Overview */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F172A]/5 text-sm font-semibold text-[#0F172A]">
                      {(neighbourhood.displayName ?? neighbourhood.areaName).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#0F172A]">
                        {neighbourhood.displayName ?? neighbourhood.areaName}
                      </h2>
                      <p className="text-sm text-slate-500">{neighbourhood.lga ?? 'LGA missing'}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {renderScoreField('Overall score', neighbourhood.overallScore)}
                    {renderFloodField('Flood risk', neighbourhood.floodRisk)}
                    {renderScoreField('Commute score', neighbourhood.commuteScore)}
                    {renderScoreField('Security score', neighbourhood.securityScore)}
                    {renderField('Properties count', neighbourhood.propertiesCount)}
                    {renderField('Bank count', neighbourhood.bankCount)}
                  </div>
                </div>

                {/* Images */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                  <h3 className="text-base font-semibold text-[#0F172A]">Images</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {renderImageField('Hero', neighbourhood.imageUrl)}
                    {renderImageField('School', neighbourhood.imageUrlSchool)}
                    {renderImageField('Street', neighbourhood.imageUrlStreet)}
                    {renderImageField('Bank', neighbourhood.imageUrlBank)}
                    {renderImageField('Market', neighbourhood.imageUrlMarket)}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                <h3 className="text-base font-semibold text-[#0F172A]">Details</h3>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {renderField('Description', neighbourhood.description)}
                  {renderField('Data confidence', neighbourhood.dataConfidence)}
                  {renderField('Data sources', neighbourhood.dataSources?.join(', '))}
                  {renderField('Total reports used', neighbourhood.totalReportsUsed)}
                </div>
              </div>

              {/* Object groups */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 space-y-6">
                {renderObjectFields('Amenities', neighbourhood.amenities as Record<string, unknown>)}
                {renderObjectFields('School counts', neighbourhood.schoolCounts as Record<string, unknown>)}
                {renderObjectFields('Typical rent range', neighbourhood.typicalRentRange as Record<string, unknown>)}
                {renderObjectFields('Travel times to hubs', neighbourhood.travelTimesToHubs as Record<string, unknown>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminNeighbourhoodViewPage;