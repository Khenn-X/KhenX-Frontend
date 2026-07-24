import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAgentEnquiries } from '../../hooks/useEnquiries';
import EnquiryItem from './EnquiryItem';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import EmptyState from '../shared/EmptyState';
import {type EnquiryStatus } from '../../types/enquiry.types';
import { cn } from '../../lib/utils';

const TABS: { label: string; value: EnquiryStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Responded', value: 'responded' },
];

const EnquiryList = () => {
  const [activeTab, setActiveTab] = useState<EnquiryStatus | 'all'>('all');
  const { data, isLoading, isError, error, refetch } = useAgentEnquiries(
    activeTab === 'all' ? undefined : activeTab
  );

  const enquiries = data?.data?.enquiries ?? [];

  return (
    <div>
      {/* Tab filter */}
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage message={error?.message} onRetry={refetch} />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          description={
            activeTab === 'all'
              ? 'When seekers contact you about your listings, their messages will appear here.'
              : `No ${activeTab} enquiries at the moment.`
          }
        />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <EnquiryItem key={enquiry._id} enquiry={enquiry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnquiryList;
