import { MoreVertical, CheckCircle } from "lucide-react";

const dummyProjects = [
  { name: "Listing Onboarding Revamp", members: 4, budget: "$14,000", completion: 85 },
  { name: "Add Progress Tracking", members: 2, budget: "$3,000", completion: 20 },
  { name: "Fix Platform Errors", members: 2, budget: "Not set", completion: 100 },
  { name: "Launch Mobile App", members: 4, budget: "$20,500", completion: 65 },
  { name: "New Pricing Page", members: 1, budget: "$500", completion: 40 },
];

const ProjectsTable = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-[#059669]" />
        <p className="text-sm font-semibold text-[#002948]">30 done this month</p>
      </div>
      <MoreVertical className="h-4 w-4 text-slate-300" />
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
          <th className="pb-3 font-medium">Project</th>
          <th className="pb-3 font-medium">Members</th>
          <th className="pb-3 font-medium">Budget</th>
          <th className="pb-3 font-medium">Completion</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {dummyProjects.map((p) => (
          <tr key={p.name}>
            <td className="py-3 font-medium text-[#002948]">{p.name}</td>
            <td className="py-3 text-slate-500">{p.members}</td>
            <td className="py-3 text-slate-500">{p.budget}</td>
            <td className="py-3 w-32">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#006A61]" style={{ width: `${p.completion}%` }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProjectsTable;