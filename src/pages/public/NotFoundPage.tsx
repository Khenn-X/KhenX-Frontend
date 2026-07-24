import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import PageWrapper from '../../components/layout/PageWrapper';

const NotFoundPage = () => {
  return (
    <PageWrapper className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      {/* Decorative */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0A1628]">
        <MapPin className="h-10 w-10 text-[#00C9A7]" />
      </div>

      <h1 className="text-6xl font-bold text-[#0A1628]">404</h1>
      <p className="mt-3 text-xl font-semibold text-slate-700">Page not found</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
        This page doesn't exist or may have been moved. Let's get you back on track.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 rounded-lg bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          to={ROUTES.LISTINGS}
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Browse listings
        </Link>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
