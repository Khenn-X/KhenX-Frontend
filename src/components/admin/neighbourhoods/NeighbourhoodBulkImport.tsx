import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, UploadCloud } from 'lucide-react';
import { neighbourhoodApi } from '../../../api/neighbourhood.api';
import { cn } from '../../../lib/utils';
import { neighbourhoodKeys } from '../../../hooks/useNeighbourhood';
import toast from 'react-hot-toast';

type ImportPreviewRow = {
  rowNumber: number;
  areaName: string;
  displayName: string;
  validation: string | null;
  action: string | null;
  status: 'ok' | 'error';
};

const HEADERS = [
  'areaName',
  'displayName',
  'lga',
  'powerScore',
  'powerAvgHoursDaily',
  'floodRisk',
  'floodNotes',
  'securityScore',
  'commuteScore',
  'dataConfidence',
  'totalReportsUsed',
  'dataSources',
  'description',
  'amenities.hospitals',
  'amenities.schools',
  'amenities.markets',
  'amenities.malls',
  'schoolCounts.primary',
  'schoolCounts.secondary',
  'schoolCounts.tertiary',
  'schoolCounts.total',
  'bankCount',
  'marketCount',
  'transitSafetyScore',
  'motoristCoverageKm',
  'transitNotes',
  'typicalRentRange.min',
  'typicalRentRange.max',
  'imageUrl',
  'imageUrlSchool',
  'imageUrlStreet',
  'imageUrlBank',
  'imageUrlMarket',
  'overallScore',
  'avgRentMin',
  'avgRentMax',
  'rentCurrency',
  'propertiesCount',
  'isFeatured',
  'travelTimesToHubs.victoriaIsland',
  'travelTimesToHubs.ikeja',
  'travelTimesToHubs.lekki',
  'travelTimesToHubs.maryland',
];

const NeighbourhoodBulkImport = ({ onCommit }: { onCommit?: () => void }) => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [remoteCsvUrl, setRemoteCsvUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string>('');

  const templateUrl = useMemo(() => {
    const csv = [HEADERS.join(','), ''].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoadingUrl(true);
    setSelectedFile(file);
    setPreviewMessage('');

    try {
      const response = await neighbourhoodApi.importNeighbourhoodCsv(file);
      setRows(response.rows);
      setErrors(response.errors || []);
      setPreviewOpen(true);
      setPreviewMessage('CSV validation complete.');
    } catch (error) {
      const message = (error as Error)?.message || 'Unable to validate the CSV file. Please try again.';
      toast.error(message);
      setRows([]);
      setErrors([message]);
      setPreviewOpen(true);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      toast.error('Upload a CSV file before confirming import.');
      return;
    }

    if (errors.length > 0) {
      toast.error('Resolve row validation errors before confirming import.');
      return;
    }

    setIsCommitting(true);
    setPreviewMessage('');

    try {
      const response = await neighbourhoodApi.importNeighbourhoodCsv(selectedFile, true);
      setRows(response.rows);
      setErrors(response.errors || []);
      setPreviewMessage(response.message || 'CSV import committed successfully.');
      toast.success('CSV import committed successfully.');
      console.log('[NeighbourhoodBulkImport] commit successful, invalidating query key:', neighbourhoodKeys.lists(), 'response:', response);
      queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.lists(), exact: true });
      if (onCommit) onCommit();
    } catch (unknownError) {
      const parsedError = unknownError as Error & { responseData?: { data?: { rows?: ImportPreviewRow[]; errors?: string[] } } };
      const message = parsedError?.message || 'Commit failed. Please check the row errors and try again.';
      toast.error(message);

      const responseData = parsedError.responseData;
      if (responseData?.data?.rows) {
        setRows(responseData.data.rows);
      }
      if (responseData?.data?.errors) {
        setErrors(responseData.data.errors);
      }
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Bulk import neighbourhood data</h2>
          <p className="mt-1 text-sm text-slate-500">
            Download the template, fill it out, and upload it here. Rows are validated before commit.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <a
          href={templateUrl}
          download="neighbourhood-intelligence-template.csv"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download template
        </a>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:border-[#00C9A7] hover:bg-[#00C9A7]/5 transition-colors">
            <UploadCloud className="mx-auto h-8 w-8 text-[#00C9A7]" />
            <p className="mt-4 text-sm text-slate-600">Upload a completed CSV file from your device</p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Load CSV from URL</label>
            <div className="flex gap-3">
              <input
                value={remoteCsvUrl}
                onChange={(event) => setRemoteCsvUrl(event.target.value)}
                placeholder="https://example.com/neighbourhoods.csv"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] focus:ring-[#00C9A7]/20"
              />
              <button
                type="button"
                disabled={!remoteCsvUrl || isLoadingUrl}
                onClick={async () => {
                  setIsLoadingUrl(true);
                  try {
                    const response = await fetch(remoteCsvUrl);
                    const text = await response.text();
                    handleFileUpload(new File([text], 'remote-neighbourhoods.csv', { type: 'text/csv' }));
                    setRemoteCsvUrl('');
                  } catch {
                    toast.error('Unable to load CSV from that URL. Check the link and CORS settings.');
                  } finally {
                    setIsLoadingUrl(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00b38d] disabled:opacity-60 transition-colors"
              >
                {isLoadingUrl ? 'Loading…' : 'Load URL'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Use a remote CSV URL or upload a file directly from your computer.</p>
          </div>
        </div>

        {previewOpen && (
          <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Import preview</p>
                <p className="text-sm text-slate-500">Rows are validated before confirming. Errors appear per-row.</p>
                {previewMessage && <p className="mt-1 text-sm text-slate-500">{previewMessage}</p>}
              </div>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isCommitting || errors.length > 0}
                className="inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {isCommitting ? 'Committing…' : 'Confirm import'}
              </button>
            </div>

            {errors.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Validation errors found</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Area name</th>
                    <th className="px-3 py-2">Display name</th>
                    <th className="px-3 py-2">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                      <td className="border-t border-slate-200 px-3 py-2">{index + 2}</td>
                      <td className="border-t border-slate-200 px-3 py-2">{row.areaName || '-'}</td>
                      <td className="border-t border-slate-200 px-3 py-2">{row.displayName || '-'}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-sm text-red-600">
                        {row.validation || 'OK'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighbourhoodBulkImport;
