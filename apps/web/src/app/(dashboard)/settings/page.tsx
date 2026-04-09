export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg">
        <h2 className="font-semibold text-gray-800 mb-4">Advisor Branding</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Your firm name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FSP Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Colour</label>
            <input type="color" defaultValue="#1d4ed8" className="h-10 w-20 rounded border border-gray-300 cursor-pointer" />
          </div>
          <button className="bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
