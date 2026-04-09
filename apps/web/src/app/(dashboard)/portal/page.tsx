import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function ClientPortalPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Self-service portal for your clients</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Client Portal Coming Soon</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            The client portal will allow your clients to view their portfolios, access reports, and
            track their financial plan progress. This feature is coming in a future release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
