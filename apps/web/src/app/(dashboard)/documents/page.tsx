'use client';

import { useState, useCallback } from 'react';
import { useDocuments, useDocumentStats, useUploadDocument, useDeleteDocument, useFileUpload } from '@/lib/hooks/use-documents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Trash2, AlertTriangle, HardDrive, Clock, FolderOpen, CloudUpload } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const DOC_TYPES = ['fica', 'id_document', 'proof_of_address', 'tax_certificate', 'financial_statement', 'policy_document', 'quote', 'mandate', 'contract', 'other'];
const DOC_CATEGORIES = ['client', 'compliance', 'advisory', 'administrative'];

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { data: docs = [], isLoading } = useDocuments(undefined, typeFilter || undefined);
  const { data: stats } = useDocumentStats();
  const upload = useUploadDocument();
  const fileUpload = useFileUpload();
  const deleteDoc = useDeleteDocument();

  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState('other');
  const [uploadCategory, setUploadCategory] = useState('client');
  const [form, setForm] = useState({ name: '', type: 'other', category: 'client', description: '', file_url: '', client_id: '', expiry_date: '' });

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', file.name);
      fd.append('type', uploadType);
      fd.append('category', uploadCategory);
      fileUpload.mutate(fd);
    });
  }, [fileUpload, uploadType, uploadCategory]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); handleFileDrop(e.dataTransfer.files); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage client and firm documents</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="w-4 h-4 mr-2" />Add Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Document Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>File URL *</Label><Input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Client ID</Label><Input value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} placeholder="Optional — link to client" /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <Button disabled={!form.name || !form.file_url || upload.isPending} onClick={() => {
                const dto: any = { ...form };
                if (!dto.client_id) delete dto.client_id;
                if (!dto.expiry_date) delete dto.expiry_date;
                if (!dto.description) delete dto.description;
                upload.mutate(dto);
                setOpen(false);
                setForm({ name: '', type: 'other', category: 'client', description: '', file_url: '', client_id: '', expiry_date: '' });
              }}>Upload</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4 flex items-center gap-3"><FolderOpen className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Documents</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><HardDrive className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p><p className="text-sm text-muted-foreground">Total Size</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.expiringSoon}</p><p className="text-sm text-muted-foreground">Expiring Soon</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Clock className="w-8 h-8 text-purple-500" /><div><p className="text-2xl font-bold">{Object.keys(stats.byType).length}</p><p className="text-sm text-muted-foreground">Document Types</p></div></CardContent></Card>
        </div>
      )}

      {/* Drag-and-Drop Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        }`}
      >
        <CloudUpload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm font-medium">{dragActive ? 'Drop files here' : 'Drag & drop files to upload'}</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse (max 20MB per file)</p>
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ position: 'relative', height: 'auto', width: 'auto', marginTop: '8px' }}
          onChange={e => handleFileDrop(e.target.files)}
        />
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Type:</Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Category:</Label>
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {fileUpload.isPending && <p className="text-xs text-primary mt-2">Uploading...</p>}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
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
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-left">Expiry</th>
                  <th className="p-3 text-left">Uploaded</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : docs.length === 0 ? (
                  <tr><td colSpan={7} className="p-0">
                    <EmptyState
                      icon={FolderOpen}
                      title="No documents found"
                      description={typeFilter ? 'Try a different filter.' : 'Upload your first document to get started with document management.'}
                      actionLabel="Upload Document"
                      onAction={() => setOpen(true)}
                    />
                  </td></tr>
                ) : docs.map((doc: any) => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline">{doc.type?.replace(/_/g, ' ')}</Badge></td>
                    <td className="p-3"><Badge variant="secondary">{doc.category}</Badge></td>
                    <td className="p-3 text-muted-foreground">{formatBytes(doc.file_size || 0)}</td>
                    <td className="p-3">
                      {doc.expiry_date ? (
                        <span className={new Date(doc.expiry_date) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {new Date(doc.expiry_date).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {doc.file_url && <Button variant="ghost" size="sm" asChild><a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a></Button>}
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(doc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteDoc.isPending}
        onConfirm={() => { if (confirmDeleteId) deleteDoc.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) }); }}
      />
    </div>
  );
}
