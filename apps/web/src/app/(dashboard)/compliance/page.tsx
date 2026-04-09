export default function CompliancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Compliance</h1>
      <div className="grid gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Records of Advice</h2>
          <p className="text-gray-400 text-sm">No ROAs created yet.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Audit Trail</h2>
          <p className="text-gray-400 text-sm">All advisor actions are logged here automatically.</p>
        </div>
      </div>
    </div>
  );
}
