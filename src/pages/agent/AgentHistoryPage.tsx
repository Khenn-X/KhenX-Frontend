import { Receipt } from 'lucide-react';
import PaymentHistoryList from '../../components/payments/PaymentHistoryList';

const AgentHistoryPage = () => (
  <div className="space-y-6">
    <div>
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-[#006A61]" />
        <h1 className="text-2xl font-bold text-[#002948]">History</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Every payment attempt associated with your agent account.</p>
    </div>
    <PaymentHistoryList />
  </div>
);

export default AgentHistoryPage;