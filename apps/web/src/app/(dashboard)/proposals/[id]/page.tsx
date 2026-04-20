'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Trash2, Save, Eye, Send, ChevronDown, ChevronUp, Download } from 'lucide-react';
import {
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useSendProposal,
  useProposalTemplates,
} from '@/lib/hooks/use-crm';
import { useLeads } from '@/lib/hooks/use-crm';
import { useClients } from '@/lib/hooks/use-clients';
import {
  ProductType,
  PRODUCT_TYPE_LABELS,
  RISK_PRODUCT_TYPES,
  INVESTMENT_PRODUCT_TYPES,
  MEDICAL_PRODUCT_TYPES,
  SHORT_TERM_PRODUCT_TYPES,
  DEFAULT_DISCLAIMER_TEXT,
  DEFAULT_PROPOSAL_SECTIONS,
} from '@steward/shared';
import type { ProposalProduct, ProposalSection, ProposalTemplateType } from '@steward/shared';
import { downloadProposalPdf } from '@/components/proposals/proposal-preview';
import type { ProposalPdfData } from '@/components/proposals/proposal-preview';

const fmt = (n?: number) => (n ? `R ${n.toLocaleString('en-ZA')}` : '—');

function emptyProduct(type: ProductType = ProductType.LIFE): ProposalProduct {
  return { id: uuid(), type, provider: '', product_name: '' };
}

export default function ProposalBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const { data: existing, isLoading: loadingProposal } = useProposal(isNew ? '' : id);
  const { data: templates = [] } = useProposalTemplates();
  const { data: leads = [] } = useLeads();
  const { data: clients = [] } = useClients();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal(isNew ? '' : id);
  const sendProposal = useSendProposal(isNew ? '' : id);

  const [title, setTitle] = useState('');
  const [leadId, setLeadId] = useState('');
  const [clientId, setClientId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [products, setProducts] = useState<ProposalProduct[]>([]);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER_TEXT);
  const [showPreview, setShowPreview] = useState(false);

  // Seed from existing proposal on load
  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '');
      setLeadId(existing.lead_id || '');
      setClientId(existing.client_id || '');
      setTemplateId(existing.template_id || '');
      setCoverLetter(existing.cover_letter || '');
      setProducts(existing.products?.length ? existing.products : []);
      setNotes(existing.notes || '');
      setValidUntil(existing.valid_until?.split('T')[0] || '');
    }
  }, [existing]);

  // Apply template when selected
  const selectedTemplate = templates.find(t => t.id === templateId);
  const applyTemplate = (t: ProposalTemplateType) => {
    setTemplateId(t.id);
    if (t.cover_letter_template) setCoverLetter(t.cover_letter_template);
    if (t.disclaimer_text) setDisclaimer(t.disclaimer_text);
    // Pre-populate products from template product types
    if (t.product_types?.length && products.length === 0) {
      setProducts(t.product_types.map(pt => emptyProduct(pt as ProductType)));
    }
  };

  // Auto-calc totals
  const totalMonthly = useMemo(() => {
    return products.reduce((sum, p) => {
      return sum + (p.premium_monthly || 0) + (p.monthly_contribution || 0);
    }, 0);
  }, [products]);

  const totalLumpSum = useMemo(() => {
    return products.reduce((sum, p) => {
      return sum + (p.lump_sum || 0) + (p.initial_contribution || 0) + (p.sum_insured || 0);
    }, 0);
  }, [products]);

  const addProduct = () => setProducts(prev => [...prev, emptyProduct()]);
  const removeProduct = (pid: string) => setProducts(prev => prev.filter(p => p.id !== pid));
  const updateProduct = (pid: string, patch: Partial<ProposalProduct>) =>
    setProducts(prev => prev.map(p => (p.id === pid ? { ...p, ...patch } : p)));

  const handleSave = async () => {
    const payload = {
      title,
      lead_id: leadId || undefined,
      client_id: clientId || undefined,
      template_id: templateId || undefined,
      cover_letter: coverLetter || undefined,
      products,
      notes,
      total_monthly_premium: totalMonthly,
      total_lump_sum: totalLumpSum,
      valid_until: validUntil || undefined,
    };
    if (isNew) {
      createProposal.mutate(payload as any, {
        onSuccess: (data) => router.push(`/proposals/${data.id}`),
      });
    } else {
      updateProposal.mutate(payload as any);
    }
  };

  const handleSend = () => {
    if (isNew) return;
    sendProposal.mutate(undefined, {
      onSuccess: () => router.push('/proposals'),
    });
  };

  if (!isNew && loadingProposal) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isRisk = (type: ProductType) => RISK_PRODUCT_TYPES.includes(type);
  const isInvestment = (type: ProductType) => INVESTMENT_PRODUCT_TYPES.includes(type);
  const isMedical = (type: ProductType) => MEDICAL_PRODUCT_TYPES.includes(type);
  const isShortTerm = (type: ProductType) => SHORT_TERM_PRODUCT_TYPES.includes(type);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/proposals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? 'New Proposal' : existing?.title || 'Edit Proposal'}
            </h1>
            {existing && (
              <Badge variant="outline" className="mt-1">{existing.status}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-1" />Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const pdfData: ProposalPdfData = {
                title,
                products,
                cover_letter: coverLetter,
                notes,
                total_monthly_premium: totalMonthly,
                total_lump_sum: totalLumpSum,
                valid_until: validUntil,
                disclaimer,
                advisor: existing?.advisor,
                client: existing?.client || clients.find(c => c.id === clientId) as any,
                lead: existing?.lead || leads.find(l => l.id === leadId) as any,
              };
              downloadProposalPdf(pdfData);
            }}
          >
            <Download className="h-4 w-4 mr-1" />PDF
          </Button>
          <Button onClick={handleSave} disabled={!title || createProposal.isPending || updateProposal.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {isNew ? 'Create' : 'Save'}
          </Button>
          {!isNew && existing?.status === 'draft' && (
            <Button variant="default" onClick={handleSend}>
              <Send className="h-4 w-4 mr-1" />Send
            </Button>
          )}
        </div>
      </div>

      {/* Template Selection */}
      {templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <Badge
                  key={t.id}
                  variant={templateId === t.id ? 'default' : 'outline'}
                  className="cursor-pointer select-none py-1.5 px-3"
                  onClick={() => applyTemplate(t)}
                >
                  {t.name}
                  {t.is_default && ' ★'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Comprehensive Risk & Investment Package" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger><SelectValue placeholder="Select lead…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {leads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.first_name} {l.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Valid Until</Label>
            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder="Personalised cover letter for the client…"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Merge fields: {'{{client_name}}'}, {'{{advisor_name}}'}, {'{{firm_name}}'}, {'{{date}}'}
          </p>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
          <Button size="sm" variant="outline" onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" />Add Product
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No products added yet.</p>
          )}
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              onUpdate={(patch) => updateProduct(product.id, patch)}
              onRemove={() => removeProduct(product.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Fee Disclosure & Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Notes & Fee Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Advisor Notes</Label>
            <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes or fee disclosure…" />
          </div>
          <div>
            <Label>Disclaimer</Label>
            <Textarea rows={3} value={disclaimer} onChange={e => setDisclaimer(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Total Monthly Premium</p>
              <p className="text-xl font-bold">{fmt(totalMonthly)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Total Lump Sum / Single Premium</p>
              <p className="text-xl font-bold">{fmt(totalLumpSum)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Annual Premium</p>
              <p className="text-lg font-semibold">{fmt(totalMonthly * 12)}/yr</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="text-lg font-semibold">{products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Overlay */}
      {showPreview && (
        <PreviewOverlay
          proposal={{
            title,
            products,
            cover_letter: coverLetter,
            notes,
            total_monthly_premium: totalMonthly,
            total_lump_sum: totalLumpSum,
            valid_until: validUntil,
            disclaimer,
          }}
          advisor={existing?.advisor}
          client={existing?.client || clients.find(c => c.id === clientId)}
          lead={existing?.lead || leads.find(l => l.id === leadId)}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────

function ProductCard({
  product,
  index,
  onUpdate,
  onRemove,
}: {
  product: ProposalProduct;
  index: number;
  onUpdate: (patch: Partial<ProposalProduct>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isRisk = RISK_PRODUCT_TYPES.includes(product.type);
  const isInvestment = INVESTMENT_PRODUCT_TYPES.includes(product.type);
  const isMedical = MEDICAL_PRODUCT_TYPES.includes(product.type);
  const isShortTerm = SHORT_TERM_PRODUCT_TYPES.includes(product.type);

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{index + 1}</Badge>
          <span className="text-sm font-medium">
            {product.product_name || PRODUCT_TYPE_LABELS[product.type] || 'Untitled'}
          </span>
          <Badge variant="secondary" className="text-xs">{PRODUCT_TYPE_LABELS[product.type]}</Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="p-3 grid gap-3">
          {/* Common fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Product Type</Label>
              <Select value={product.type} onValueChange={(v) => onUpdate({ type: v as ProductType })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Provider</Label>
              <Input className="h-9" value={product.provider} onChange={e => onUpdate({ provider: e.target.value })} placeholder="e.g. Sanlam, Discovery" />
            </div>
            <div>
              <Label className="text-xs">Product Name</Label>
              <Input className="h-9" value={product.product_name} onChange={e => onUpdate({ product_name: e.target.value })} placeholder="e.g. Life Plan Plus" />
            </div>
          </div>

          <Separator />

          {/* Risk product fields */}
          {isRisk && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Cover Amount (R)</Label>
                <Input className="h-9" type="number" value={product.cover_amount || ''} onChange={e => onUpdate({ cover_amount: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Monthly Premium (R)</Label>
                <Input className="h-9" type="number" value={product.premium_monthly || ''} onChange={e => onUpdate({ premium_monthly: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Lump Sum (R)</Label>
                <Input className="h-9" type="number" value={product.lump_sum || ''} onChange={e => onUpdate({ lump_sum: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Term (years)</Label>
                <Input className="h-9" type="number" value={product.term_years || ''} onChange={e => onUpdate({ term_years: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Escalation Rate (%)</Label>
                <Input className="h-9" type="number" value={product.escalation_rate || ''} onChange={e => onUpdate({ escalation_rate: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Waiting Period</Label>
                <Input className="h-9" value={product.waiting_period || ''} onChange={e => onUpdate({ waiting_period: e.target.value })} placeholder="e.g. 6 months" />
              </div>
              <div>
                <Label className="text-xs">Payment Pattern</Label>
                <Select value={product.payment_pattern || ''} onValueChange={v => onUpdate({ payment_pattern: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="age_rated">Age-Rated</SelectItem>
                    <SelectItem value="compulsory_escalation">Compulsory Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Investment product fields */}
          {isInvestment && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Initial Contribution (R)</Label>
                <Input className="h-9" type="number" value={product.initial_contribution || ''} onChange={e => onUpdate({ initial_contribution: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Monthly Contribution (R)</Label>
                <Input className="h-9" type="number" value={product.monthly_contribution || ''} onChange={e => onUpdate({ monthly_contribution: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Platform</Label>
                <Input className="h-9" value={product.platform || ''} onChange={e => onUpdate({ platform: e.target.value })} placeholder="e.g. Allan Gray, Glacier" />
              </div>
              <div>
                <Label className="text-xs">Fund Selection</Label>
                <Input className="h-9" value={(product.fund_selection || []).join(', ')} onChange={e => onUpdate({ fund_selection: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Comma-separated fund names" />
              </div>
              <div>
                <Label className="text-xs">Escalation Rate (%)</Label>
                <Input className="h-9" type="number" value={product.escalation_rate || ''} onChange={e => onUpdate({ escalation_rate: +e.target.value || undefined })} />
              </div>
            </div>
          )}

          {/* Medical product fields */}
          {isMedical && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Plan Name</Label>
                <Input className="h-9" value={product.plan_name || ''} onChange={e => onUpdate({ plan_name: e.target.value })} placeholder="e.g. Keycare Plus" />
              </div>
              <div>
                <Label className="text-xs">Monthly Premium (R)</Label>
                <Input className="h-9" type="number" value={product.premium_monthly || ''} onChange={e => onUpdate({ premium_monthly: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Dependents Covered</Label>
                <Input className="h-9" type="number" value={product.dependents_covered || ''} onChange={e => onUpdate({ dependents_covered: +e.target.value || undefined })} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={product.gap_cover_included || false} onCheckedChange={(v: boolean) => onUpdate({ gap_cover_included: v })} />
                <Label className="text-xs">Gap Cover Included</Label>
              </div>
            </div>
          )}

          {/* Short-term product fields */}
          {isShortTerm && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Insured Item</Label>
                <Input className="h-9" value={product.insured_item || ''} onChange={e => onUpdate({ insured_item: e.target.value })} placeholder="e.g. Household contents" />
              </div>
              <div>
                <Label className="text-xs">Monthly Premium (R)</Label>
                <Input className="h-9" type="number" value={product.premium_monthly || ''} onChange={e => onUpdate({ premium_monthly: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Sum Insured (R)</Label>
                <Input className="h-9" type="number" value={product.sum_insured || ''} onChange={e => onUpdate({ sum_insured: +e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">Excess (R)</Label>
                <Input className="h-9" type="number" value={product.excess || ''} onChange={e => onUpdate({ excess: +e.target.value || undefined })} />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-xs">Product Notes</Label>
            <Textarea className="min-h-[60px]" value={product.notes || ''} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Additional notes for this product…" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview Overlay ────────────────────────────────────────

function PreviewOverlay({
  proposal,
  advisor,
  client,
  lead,
  onClose,
}: {
  proposal: {
    title: string;
    products: ProposalProduct[];
    cover_letter?: string;
    notes?: string;
    total_monthly_premium: number;
    total_lump_sum: number;
    valid_until?: string;
    disclaimer?: string;
  };
  advisor?: { name: string; firm_name: string; fsp_number?: string; logo_url?: string; primary_colour_hex?: string };
  client?: { first_name: string; last_name: string; email?: string };
  lead?: { first_name: string; last_name: string; email?: string };
  onClose: () => void;
}) {
  const recipient = client || lead;
  const brandColour = advisor?.primary_colour_hex || '#1a1a2e';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-[800px] min-h-[1000px]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-muted rounded-t-lg">
          <span className="text-sm font-medium">Proposal Preview</span>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Branded header */}
        <div className="px-8 py-6" style={{ borderBottom: `3px solid ${brandColour}` }}>
          <div className="flex items-center justify-between">
            <div>
              {advisor?.logo_url && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || ''}${advisor.logo_url}`}
                  alt="Firm logo"
                  className="h-12 w-auto mb-2"
                />
              )}
              <h1 className="text-2xl font-bold" style={{ color: brandColour }}>{proposal.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Prepared for: {recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Client'}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{advisor?.firm_name || 'Your Firm'}</p>
              {advisor?.fsp_number && <p>FSP {advisor.fsp_number}</p>}
              <p>{new Date().toLocaleDateString('en-ZA')}</p>
              {proposal.valid_until && <p>Valid until: {new Date(proposal.valid_until).toLocaleDateString('en-ZA')}</p>}
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        {proposal.cover_letter && (
          <div className="px-8 py-4">
            <h2 className="text-lg font-semibold mb-2" style={{ color: brandColour }}>Cover Letter</h2>
            <div className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
              {proposal.cover_letter
                .replace(/\{\{client_name\}\}/g, recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Client')
                .replace(/\{\{advisor_name\}\}/g, advisor?.name || 'Advisor')
                .replace(/\{\{firm_name\}\}/g, advisor?.firm_name || 'Firm')
                .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-ZA'))}
            </div>
          </div>
        )}

        {/* Products */}
        {proposal.products.length > 0 && (
          <div className="px-8 py-4">
            <h2 className="text-lg font-semibold mb-3" style={{ color: brandColour }}>Product Details</h2>
            {proposal.products.map((p, i) => (
              <div key={p.id} className="mb-4 border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{p.product_name || PRODUCT_TYPE_LABELS[p.type]}</h3>
                    <p className="text-xs text-gray-500">{PRODUCT_TYPE_LABELS[p.type]} • {p.provider || 'Provider TBC'}</p>
                  </div>
                  {(p.premium_monthly || p.monthly_contribution) && (
                    <span className="font-bold text-sm">
                      {fmt(p.premium_monthly || p.monthly_contribution)}/pm
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {p.cover_amount != null && <div className="flex justify-between"><span className="text-gray-500">Cover Amount:</span><span>{fmt(p.cover_amount)}</span></div>}
                  {p.lump_sum != null && <div className="flex justify-between"><span className="text-gray-500">Lump Sum:</span><span>{fmt(p.lump_sum)}</span></div>}
                  {p.term_years != null && <div className="flex justify-between"><span className="text-gray-500">Term:</span><span>{p.term_years} years</span></div>}
                  {p.escalation_rate != null && <div className="flex justify-between"><span className="text-gray-500">Escalation:</span><span>{p.escalation_rate}%</span></div>}
                  {p.waiting_period && <div className="flex justify-between"><span className="text-gray-500">Waiting Period:</span><span>{p.waiting_period}</span></div>}
                  {p.payment_pattern && <div className="flex justify-between"><span className="text-gray-500">Payment Pattern:</span><span>{p.payment_pattern}</span></div>}
                  {p.initial_contribution != null && <div className="flex justify-between"><span className="text-gray-500">Initial Contribution:</span><span>{fmt(p.initial_contribution)}</span></div>}
                  {p.platform && <div className="flex justify-between"><span className="text-gray-500">Platform:</span><span>{p.platform}</span></div>}
                  {p.fund_selection?.length ? <div className="flex justify-between col-span-2"><span className="text-gray-500">Funds:</span><span>{p.fund_selection.join(', ')}</span></div> : null}
                  {p.plan_name && <div className="flex justify-between"><span className="text-gray-500">Plan:</span><span>{p.plan_name}</span></div>}
                  {p.dependents_covered != null && <div className="flex justify-between"><span className="text-gray-500">Dependents:</span><span>{p.dependents_covered}</span></div>}
                  {p.gap_cover_included && <div className="flex justify-between"><span className="text-gray-500">Gap Cover:</span><span>Included</span></div>}
                  {p.insured_item && <div className="flex justify-between"><span className="text-gray-500">Insured Item:</span><span>{p.insured_item}</span></div>}
                  {p.sum_insured != null && <div className="flex justify-between"><span className="text-gray-500">Sum Insured:</span><span>{fmt(p.sum_insured)}</span></div>}
                  {p.excess != null && <div className="flex justify-between"><span className="text-gray-500">Excess:</span><span>{fmt(p.excess)}</span></div>}
                </div>
                {p.notes && <p className="text-xs text-gray-500 mt-2 italic">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Summary Table */}
        <div className="px-8 py-4">
          <h2 className="text-lg font-semibold mb-2" style={{ color: brandColour }}>Cost Summary</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-right p-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-2">Total Monthly Premium</td><td className="p-2 text-right font-semibold">{fmt(proposal.total_monthly_premium)}</td></tr>
                <tr><td className="p-2">Total Lump Sum</td><td className="p-2 text-right font-semibold">{fmt(proposal.total_lump_sum)}</td></tr>
                <tr className="bg-gray-50"><td className="p-2 font-semibold">Annual Premium</td><td className="p-2 text-right font-bold">{fmt(proposal.total_monthly_premium * 12)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        {proposal.disclaimer && (
          <div className="px-8 py-4 border-t mt-4">
            <h2 className="text-xs font-semibold text-gray-500 mb-1">Disclaimer</h2>
            <p className="text-xs text-gray-400 leading-relaxed">{proposal.disclaimer}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 text-center text-xs text-gray-400 border-t" style={{ borderTopColor: brandColour }}>
          {advisor?.firm_name || 'Your Firm'} {advisor?.fsp_number ? `| FSP ${advisor.fsp_number}` : ''}
        </div>
      </div>
    </div>
  );
}
