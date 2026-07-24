import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import NeighbourhoodDataForm from '../../components/admin/neighbourhoods/NeighbourhoodDataForm';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import { ROUTES } from '../../constants/routes';

const AdminNeighbourhoodEditPage = () => {
  const { areaName } = useParams<{ areaName: string }>();
  const { data, isLoading, isError, refetch } = useAllAreas();
  const areas = useMemo(() => data?.data?.areas ?? [], [data]);
  const navigate = useNavigate();

  const matchingArea = useMemo(
    () => areas.find((area) => area.areaName === areaName),
    [areas, areaName],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Editing
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {matchingArea?.displayName ?? matchingArea?.areaName ?? 'Edit Neighbourhood'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Update the selected neighbourhood intelligence record. Save to persist your changes.
          </p>
        </div>
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
      </div>

      {isLoading && <LoadingSpinner label="Loading neighbourhood metadata..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8">
          {matchingArea ? (
            <NeighbourhoodDataForm
              areas={areas}
              selectedAreaName={matchingArea.areaName}
              onSaved={() => navigate(ROUTES.ADMIN_NEIGHBOURHOODS)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center">
              <svg className="h-8 w-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-rose-700">
                Neighbourhood not found. Please return to the list and select a valid area.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNeighbourhoodEditPage;