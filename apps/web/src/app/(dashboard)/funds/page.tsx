export default function FundsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fund Universe</h1>
        <a
          href="/funds/upload"
          className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
        >
          Upload Fact Sheet
        </a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-gray-400 text-sm">No funds loaded. Upload a PDF fact sheet to extract holdings.</p>
      </div>
    </div>
  );
}
