import { Link } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PaymentHistoryList from '../../components/payments/PaymentHistoryList';
import { ROUTES } from '../../constants/routes';

const PaymentHistoryPage = () => (
  <PageWrapper className="py-10">
    <div className="mb-6 flex items-center gap-3">
      <Link to={ROUTES.DASHBOARD} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Back to dashboard">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#00C9A7]" />
          <h1 className="text-2xl font-bold text-[#0F172A]">Payment History</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">Review payments made through your KhenX account.</p>
      </div>
    </div>
    <PaymentHistoryList />
  </PageWrapper>
);

export default PaymentHistoryPage;