import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePaginatedAreas } from '../../hooks/useNeighbourhood';
import { neighbourhoodApi } from '../../api/neighbourhood.api';
import ConfirmModal from '../../components/shared/ConfirmModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';

const ITEMS_PER_PAGE = 10;

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

// Builds a compact page list like [1, 2, 3, '…', 9, 10] instead of rendering
// every page number when there are many pages.
const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);

  return pages;
};

const AdminNeighbourhoodsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ areaName: string; displayName: string } | null>(null);

  const { data, isLoading, isError, refetch } = usePaginatedAreas(currentPage, ITEMS_PER_PAGE, filter);
  const paginatedData = data as any;
  const areas: any[] = useMemo(() => paginatedData?.data?.areas ?? [], [paginatedData]);
  const total = paginatedData?.data?.total ?? (areas ? areas.length : 0);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (areaName: string) => neighbourhoodApi.deleteNeighbourhood(areaName),
    onSuccess: (response) => {
      toast.success(response?.message || 'Neighbourhood deleted successfully.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['neighbourhood', 'list'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete neighbourhood. Please try again.');
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Reset to page 1 whenever the search term changes, so you're never left
  // stranded on a page that no longer has any matching results.
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // If the underlying data shrinks (e.g. after a delete) and the current
  // page no longer exists, clamp back to the last valid page.
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Admin
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Neighbourhood Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Manage neighbourhood records from a single table. Create new areas, view details, or edit existing neighbourhoods.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOOD_IMPORT)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M10 3v9m0 0-3-3m3 3 3-3M4 14v1.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Import bulk neighbourhoods
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOOD_NEW)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C9A7] px-4 py-2.5 text-sm font-semibold text-[#0A1628] shadow-sm shadow-[#00C9A7]/30 transition-colors hover:bg-[#00E0BA]"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
            Create new neighbourhood
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading neighbourhoods..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-[#0F172A]">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              of <span className="font-semibold text-[#0F172A]">{total}</span> neighbourhoods
            </p>
            <div className="relative w-full sm:w-72">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="m17 17-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                placeholder="Search neighbourhoods"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#00C9A7] focus:bg-white focus:ring-2 focus:ring-[#00C9A7]/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Flood</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areas.map((area) => (
                  <tr key={area.areaName} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A]/5 text-xs font-semibold text-[#0F172A]">
                          {String(area.displayName ?? area.areaName ?? 'NA').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#0F172A]">{area.displayName ?? area.areaName ?? 'Unnamed neighbourhood'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex min-w-[2.5rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClasses(area.overallScore)}`}>
                        {area.overallScore ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getFloodBadgeClasses(area.floodRisk)}`}>
                        {area.floodRisk ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {area.createdAt ? new Date(area.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOOD_VIEW(area.areaName))}
                          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.ADMIN_NEIGHBOURHOOD_EDIT(area.areaName))}
                          className="rounded-full bg-[#00C9A7]/10 px-3.5 py-1.5 text-xs font-semibold text-[#00A88C] transition-colors hover:bg-[#00C9A7]/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({
                            areaName: area.areaName,
                            displayName: area.displayName ?? area.areaName,
                          })}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {areas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-sm">No neighbourhoods match your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {total > 0 && totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row">
              <p className="text-xs text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  aria-label="Previous page"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 5 6 10l6 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        page === currentPage
                          ? 'bg-[#0A1628] text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  aria-label="Next page"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="m8 5 6 5-6 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.areaName);
        }}
        title="Delete neighbourhood"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.displayName}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isPending={deleteMutation.status === 'pending'}
      />
    </div>
  );
};

export default AdminNeighbourhoodsPage;