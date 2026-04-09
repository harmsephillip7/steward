export default function ClientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <a
          href="/clients/new"
          className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
        >
          + New Client
        </a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-gray-400 text-sm">No clients yet. Add your first client to get started.</p>
      </div>
    </div>
  );
}
