'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments, useDocumentStats } from '@/lib/hooks/use-documents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, AlertTriangle, HardDrive, Clock, FolderOpen, Search, ExternalLink, Download } from 'lucide-react';

const DOC_TYPES = ['fica', 'id_document', 'proof_of_address', 'tax_certificate', 'financial_statement', 'policy_document', 'quote', 'mandate', 'contract', 'other'];

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function typeLabel(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function DocumentVaultPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const { data: allDocs = [], isLoading } = useDocuments(undefined, typeFilter || undefined);
  const { data: stats } = useDocumentStats();

  const docs = search
    ? allDocs.filter((d: any) =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.client?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.type?.toLowerCase().includes(search.toLowerCase()),
      )
    : allDocs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Vault</h1>
        <p className="text-muted-foreground">Search and browse all documents across clients. Upload documents from each client&apos;s detail page.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4 flex items-center gap-3"><FolderOpen className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Documents</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><HardDrive className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p><p className="text-sm text-muted-foreground">Total Storage</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.expiringSoon}</p><p className="text-sm text-muted-foreground">Expiring Soon</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Clock className="w-8 h-8 text-purple-500" /><div><p className="text-2xl font-bold">{Object.keys(stats.byType).length}</p><p className="text-sm text-muted-foreground">Document Types</p></div></CardContent></Card>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, client, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Document</th>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-left">Expiry</th>
                  <th className="p-3 text-left">Uploaded</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading documents...</td></tr>
                ) : docs.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center">
                    <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {search || typeFilter ? 'No documents match your search' : 'No documents uploaded yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search || typeFilter ? 'Try different search terms or filters' : 'Upload documents from each client\'s detail page'}
                    </p>
                  </td></tr>
                ) : docs.map((doc: any) => (
                  <tr key={doc.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          {doc.description && <p className="text-xs text-muted-foreground truncate">{doc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {doc.client ? (
                        <button
                          onClick={() => router.push(`/clients/${doc.client_id}`)}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {doc.client.first_name} {doc.client.last_name}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Firm document</span>
                      )}
                    </td>
                    <td className="p-3"><Badge variant="outline">{typeLabel(doc.type)}</Badge></td>
                    <td className="p-3 text-muted-foreground">{formatBytes(doc.file_size || 0)}</td>
                    <td className="p-3">
                      {doc.expiry_date ? (
                        <span className={new Date(doc.expiry_date) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {new Date(doc.expiry_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {doc.file_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={doc.file_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doc.file_url}` : doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        )}
                        {doc.client_id && (
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/clients/${doc.client_id}`)}>
                            Go to Client
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      {!isLoading && docs.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {docs.length} of {allDocs.length} documents
        </p>
      )}
    </div>
  );
}
