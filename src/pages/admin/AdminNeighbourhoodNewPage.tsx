import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import NeighbourhoodDataForm from '../../components/admin/neighbourhoods/NeighbourhoodDataForm';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import { ROUTES } from '../../constants/routes';

const AdminNeighbourhoodNewPage = () => {
  const { data, isLoading, isError, refetch } = useAllAreas();
  const areas = useMemo(() => data?.data?.areas ?? [], [data]);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Creating
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Create Neighbourhood</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Add a new neighbourhood intelligence record. Fill in the fields and save to persist the new area.
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
          <NeighbourhoodDataForm areas={areas} onSaved={() => navigate(ROUTES.ADMIN_NEIGHBOURHOODS)} />
        </div>
      )}
    </div>
  );
};

export default AdminNeighbourhoodNewPage;