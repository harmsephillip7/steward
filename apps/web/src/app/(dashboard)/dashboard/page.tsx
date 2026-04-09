export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: '—' },
          { label: 'Portfolios Screened', value: '—' },
          { label: 'Pending ROAs', value: '—' },
          { label: 'Reports Generated', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Connect the API and data will populate automatically.
      </p>
    </div>
  );
}
