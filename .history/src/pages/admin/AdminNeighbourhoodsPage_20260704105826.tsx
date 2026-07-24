import { useMemo } from 'react';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import NeighbourhoodDataForm from '../../components/admin/neighbourhoods/NeighbourhoodDataForm';
import NeighbourhoodBulkImport from '../../components/admin/neighbourhoods/NeighbourhoodBulkImport';

const AdminNeighbourhoodsPage = () => {
  const { data, isLoading, isError, refetch } = useAllAreas();
  const areas = data?.data?.areas ?? [];

  const sortedAreas = useMemo(() => {
    return [...areas].sort((a, b) => {
      const aName = String(a.displayName ?? '');
      const bName = String(b.displayName ?? '');
      return aName.localeCompare(bName);
    });
  }, [areas]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Neighbourhood Intelligence</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Create, edit, and bulk import neighbourhood intelligence records used by the platform's
              intelligence pipeline. Saves are currently mocked and will behave like successful updates
              until the backend endpoints are available.
            </p>
          </div>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading neighbourhoods..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div>
            <NeighbourhoodDataForm areas={sortedAreas} />
          </div>
          <div>
            <NeighbourhoodBulkImport />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNeighbourhoodsPage;
