import EvidenceSubmissionForm from '../../components/evidence/EvidenceSubmissionForm';

const AgentEvidencePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Evidence Submission</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share neighbourhood updates and source-backed claims for admin review.
        </p>
      </div>

      <EvidenceSubmissionForm />
    </div>
  );
};

export default AgentEvidencePage;
