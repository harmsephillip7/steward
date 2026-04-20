'use client';

import { useState, useRef } from 'react';
import { useClientDocuments, useFileUpload, useDeleteDocument } from '@/lib/hooks/use-documents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  FileText, Upload, Trash2, CloudUpload, File, X, ChevronLeft, Check, FolderOpen, Download,
  AlertTriangle,
} from 'lucide-react';

const DOC_TYPES = [
  'fica', 'id_document', 'proof_of_address', 'tax_certificate',
  'financial_statement', 'policy_document', 'quote', 'mandate', 'contract', 'other',
];
const DOC_CATEGORIES = ['client', 'compliance', 'advisory', 'administrative'];

const REQUIRED_COMPLIANCE_DOCS = [
  { type: 'id_document', label: 'ID Document' },
  { type: 'proof_of_address', label: 'Proof of Address' },
  { type: 'fica', label: 'FICA Document' },
  { type: 'tax_certificate', label: 'Tax Certificate' },
];

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function typeLabel(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Upload Wizard (client pre-selected) ── */
function UploadWizard({
  open,
  onOpenChange,
  clientId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientId: string;
}) {
  const fileUpload = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [meta, setMeta] = useState({ name: '', type: 'other', category: 'client', description: '', expiry_date: '' });

  const reset = () => {
    setStep(1);
    setSelectedFile(null);
    setDragActive(false);
    setMeta({ name: '', type: 'other', category: 'client', description: '', expiry_date: '' });
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const pickFile = (file: File) => {
    setSelectedFile(file);
    setMeta(m => ({ ...m, name: m.name || file.name.replace(/\.[^/.]+$/, '') }));
    setStep(2);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('name', meta.name || selectedFile.name);
    fd.append('type', meta.type);
    fd.append('category', meta.category);
    fd.append('client_id', clientId);
    if (meta.description) fd.append('description', meta.description);
    fileUpload.mutate(fd, { onSuccess: () => handleClose(false) });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload Document
          </DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              Select File
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</span>
              Details
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="py-2">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <CloudUpload className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
              <p className="text-base font-medium">{dragActive ? 'Drop your file here' : 'Drag & drop your file here'}</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
              <p className="text-xs text-muted-foreground mt-3">PDF, Word, Excel, Images — up to 20MB</p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.txt"
                onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ''; }}
              />
            </div>
          </div>
        )}

        {step === 2 && selectedFile && (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)} • {selectedFile.type || 'Unknown type'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setSelectedFile(null); setStep(1); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label>Document Name *</Label>
              <Input value={meta.name} onChange={e => setMeta(m => ({ ...m, name: e.target.value }))} placeholder="Enter document name" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={meta.type} onValueChange={v => setMeta(m => ({ ...m, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={meta.category} onValueChange={v => setMeta(m => ({ ...m, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={meta.expiry_date} onChange={e => setMeta(m => ({ ...m, expiry_date: e.target.value }))} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={meta.description}
                onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} disabled={!meta.name || fileUpload.isPending}>
              {fileUpload.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Client Documents Section ── */
export function ClientDocuments({ clientId }: { clientId: string }) {
  const { data: docs = [], isLoading } = useClientDocuments(clientId);
  const deleteDoc = useDeleteDocument();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const uploadedTypes = new Set(docs.map(d => d.type));
  const missingDocs = REQUIRED_COMPLIANCE_DOCS.filter(r => !uploadedTypes.has(r.type));

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Documents
              <Badge variant="secondary" className="ml-1">{docs.length}</Badge>
            </span>
            <Button size="sm" onClick={() => setWizardOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Missing compliance docs warning */}
          {missingDocs.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Missing compliance documents</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {missingDocs.map(d => (
                    <Badge
                      key={d.type}
                      variant="outline"
                      className="border-amber-300 text-amber-700 dark:text-amber-300 text-xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50"
                      onClick={() => setWizardOpen(true)}
                    >
                      + {d.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading documents...</p>
          ) : docs.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setWizardOpen(true)}>
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload First Document
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{typeLabel(doc.type)}</Badge>
                      <span className="text-xs text-muted-foreground">{formatBytes(doc.file_size || 0)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
                      {doc.expiry_date && (
                        <span className={`text-xs ${new Date(doc.expiry_date) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          Exp: {formatDate(doc.expiry_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc.file_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={doc.file_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doc.file_url}` : doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfirmDeleteId(doc.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UploadWizard open={wizardOpen} onOpenChange={setWizardOpen} clientId={clientId} />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}
        title="Delete Document"
        description="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteDoc.isPending}
        onConfirm={() => { if (confirmDeleteId) deleteDoc.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) }); }}
      />
    </>
  );
}
