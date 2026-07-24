import EnquiryList from '../../components/agent/EnquiryList';

const AgentEnquiriesPage = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Enquiries</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Messages from seekers interested in your listings
        </p>
      </div>
      <EnquiryList />
    </div>
  );
};

export default AgentEnquiriesPage;
