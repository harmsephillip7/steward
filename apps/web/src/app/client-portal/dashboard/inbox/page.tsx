'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import portalApi from '../../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Inbox as InboxIcon } from 'lucide-react';

interface InboxItem {
  id: string;
  type: string;
  title: string;
  status: string;
  sent_at: string;
  decided_at?: string;
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi
      .get<InboxItem[]>('/portal/inbox')
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <InboxIcon className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground text-sm">
            Documents your advisor has sent for your review.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>From your advisor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground py-8 text-center">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">No documents waiting for you.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.title}</TableCell>
                    <TableCell className="capitalize">{it.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{fmt(it.sent_at)}</TableCell>
                    <TableCell>
                      <StatusBadge status={it.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/client-portal/dashboard/inbox/${it.id}`}
                        className="text-primary text-sm hover:underline"
                      >
                        Open →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'accepted') return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
  if (status === 'declined') return <Badge variant="destructive">Declined</Badge>;
  if (status === 'expired') return <Badge variant="outline">Expired</Badge>;
  return <Badge>Awaiting your review</Badge>;
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit' });
}
