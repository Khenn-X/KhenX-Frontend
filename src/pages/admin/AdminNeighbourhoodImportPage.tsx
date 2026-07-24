import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import NeighbourhoodBulkImport from '../../components/admin/neighbourhoods/NeighbourhoodBulkImport';
import { ROUTES } from '../../constants/routes';
import { neighbourhoodKeys, useAllAreas } from '../../hooks/useNeighbourhood';

const AdminNeighbourhoodImportPage = () => {
  const { data, isLoading, isError, refetch } = useAllAreas();
  const areas = useMemo(() => data?.data?.areas ?? [], [data]);
  const navigate = useNavigate();

  console.log(
    '[AdminNeighbourhoodImportPage] useAllAreas status:', {
      queryKey: neighbourhoodKeys.lists(),
      dataLength: areas.length,
      rawDataCount: data?.data?.areas?.length,
      isLoading,
      isError,
    }
  );

  const totalAreas = useMemo(() => areas.length, [areas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Bulk import
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Bulk Neighbourhood Import</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Upload neighbourhood intelligence records in bulk using a CSV file, or load a CSV from a remote URL. This page is dedicated to large imports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOODS)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 6h12M4 10h12M4 14h8" strokeLinecap="round" />
          </svg>
          Single neighbourhood editor
        </button>
      </div>

      {isLoading && <LoadingSpinner label="Loading neighbourhood metadata..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="grid gap-6 lg:grid-cols-[1fr]">
          {/* Count card */}
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/10 text-[#00A88C]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current neighbourhood count
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">{totalAreas}</p>
            </div>
          </div>

          <NeighbourhoodBulkImport onCommit={() => refetch()} />
        </div>
      )}
    </div>
  );
};

export default AdminNeighbourhoodImportPage;