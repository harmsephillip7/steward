'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Settings, Building2, User } from 'lucide-react';

interface AdvisorProfile {
  id: string;
  name: string;
  email: string;
  firm_name: string;
  fsp_number: string | null;
  logo_url: string | null;
  primary_colour_hex: string | null;
}

export default function SettingsPage() {
  const { data: advisor, isLoading } = useQuery({
    queryKey: ['advisor', 'me'],
    queryFn: async () => {
      const { data } = await api.get<AdvisorProfile>('/advisors/me');
      return data;
    },
  });

  const [form, setForm] = useState({
    firm_name: '',
    fsp_number: '',
    primary_colour_hex: '#1d4ed8',
  });

  useEffect(() => {
    if (advisor) {
      setForm({
        firm_name: advisor.firm_name ?? '',
        fsp_number: advisor.fsp_number ?? '',
        primary_colour_hex: advisor.primary_colour_hex ?? '#1d4ed8',
      });
    }
  }, [advisor]);

  const updateBranding = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { data } = await api.patch('/advisors/me/branding', payload);
      return data;
    },
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your advisor profile and firm branding</p>
      </div>

      {/* Advisor info (read-only) */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Advisor Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Name</p>
              <p className="font-medium mt-0.5">{advisor?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Email</p>
              <p className="font-medium mt-0.5">{advisor?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding (editable) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Firm Branding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firm_name">Firm Name</Label>
              <Input
                id="firm_name"
                value={form.firm_name}
                onChange={(e) => setForm({ ...form, firm_name: e.target.value })}
                placeholder="e.g. Steward Financial Services"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fsp_number">FSP Number</Label>
              <Input
                id="fsp_number"
                value={form.fsp_number}
                onChange={(e) => setForm({ ...form, fsp_number: e.target.value })}
                placeholder="e.g. FSP-12345"
              />
              <p className="text-xs text-gray-500">
                Your FSCA Financial Services Provider licence number
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="brand_colour">Brand Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  id="brand_colour"
                  type="color"
                  value={form.primary_colour_hex}
                  onChange={(e) => setForm({ ...form, primary_colour_hex: e.target.value })}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer p-1"
                />
                <Input
                  value={form.primary_colour_hex}
                  onChange={(e) => setForm({ ...form, primary_colour_hex: e.target.value })}
                  className="w-36 font-mono"
                  placeholder="#1d4ed8"
                />
                <div
                  className="h-10 w-10 rounded-lg border border-gray-200"
                  style={{ backgroundColor: form.primary_colour_hex }}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => updateBranding.mutate(form)}
                disabled={updateBranding.isPending}
              >
                {updateBranding.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

