'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useMessagingConnections,
  useDisconnectConnection,
  useConnectSmtp,
  useConnectWhatsApp,
  useMetaPages,
  useSubscribeMetaPage,
  useMessages,
  useUnreadMessageCount,
  useMarkMessageRead,
  useLinkMessage,
  useSendEmail,
  useSendWhatsApp,
  useSendMessenger,
  useMessageTemplates,
  useCreateTemplate,
  useDeleteTemplate,
} from '@/lib/hooks/use-messaging';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Suspense } from 'react';
import {
  Mail, MessageSquare, Smartphone, CheckCircle2, XCircle, AlertCircle,
  Plus, Trash2, Unplug, ExternalLink, Copy, ChevronRight, ChevronLeft,
  Inbox, Send, Eye, Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MessagingConnectionType, MessageType } from '@steward/shared';
import { MessageChannel } from '@steward/shared';

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>;
  if (status === 'error')
    return <Badge variant="destructive">Error</Badge>;
  if (status === 'pending')
    return <Badge variant="outline">Pending</Badge>;
  return <Badge variant="secondary">Disconnected</Badge>;
}

// ─── Channel icon helper ──────────────────────────────────────────────────────

function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  if (channel === 'email') return <Mail className={className} />;
  if (channel === 'messenger') return <MessageSquare className={className} />;
  return <Smartphone className={className} />;
}

// ─── Message list item ────────────────────────────────────────────────────────

function MessageItem({ msg, onMarkRead, onLink }: {
  msg: MessageType;
  onMarkRead: (id: string) => void;
  onLink: (id: string) => void;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${!msg.is_read && msg.direction === 'inbound' ? 'bg-primary/5 border-primary/20' : 'border-border'}`}>
      <ChannelIcon channel={msg.channel} className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{msg.direction === 'inbound' ? msg.from_address : `→ ${msg.to_address}`}</span>
          {msg.subject && <span className="text-xs text-muted-foreground truncate">— {msg.subject}</span>}
          <Badge variant="outline" className="text-xs ml-auto shrink-0">
            {msg.direction === 'inbound' ? 'Received' : 'Sent'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.body}</p>
        <div className="flex items-center gap-2 mt-2">
          {!msg.is_read && msg.direction === 'inbound' && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onMarkRead(msg.id)}>
              <Eye className="w-3 h-3 mr-1" /> Mark read
            </Button>
          )}
          {!msg.lead_id && !msg.client_id && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onLink(msg.id)}>
              <Link2 className="w-3 h-3 mr-1" /> Link to lead
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(msg.sent_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Gmail Setup Wizard ───────────────────────────────────────────────────────

function GmailWizard({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Mail className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <p className="font-medium text-sm">Connect with Google</p>
          <p className="text-xs text-muted-foreground">You'll be redirected to Google to grant read/send access to your Gmail inbox.</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Steward will only access emails in your inbox</p>
        <p>• You can revoke access at any time from your Google Account</p>
        <p>• New emails will appear in your Integrations inbox in real-time</p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button asChild>
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/integrations/email/gmail/connect`}>
            <Mail className="w-4 h-4 mr-2" /> Connect Gmail
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Microsoft Setup Wizard ───────────────────────────────────────────────────

function MicrosoftWizard({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Mail className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <p className="font-medium text-sm">Connect with Microsoft</p>
          <p className="text-xs text-muted-foreground">Connect your Outlook, Office 365, or Microsoft 365 mailbox.</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button asChild>
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/integrations/email/microsoft/connect`}>
            <Mail className="w-4 h-4 mr-2" /> Connect Microsoft 365
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── SMTP Setup Wizard ────────────────────────────────────────────────────────

function SmtpWizard({ onClose }: { onClose: () => void }) {
  const connectSmtp = useConnectSmtp();
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState('');
  const PROVIDERS = [
    { value: 'zoho', label: 'Zoho Mail', host: 'smtp.zoho.com', port: 465, secure: true, imap: 'imap.zoho.com', imap_port: 993 },
    { value: 'hostinger', label: 'Hostinger', host: 'smtp.hostinger.com', port: 465, secure: true, imap: 'imap.hostinger.com', imap_port: 993 },
    { value: 'yahoo', label: 'Yahoo Mail', host: 'smtp.mail.yahoo.com', port: 587, secure: false, imap: 'imap.mail.yahoo.com', imap_port: 993, note: 'Requires an App Password — manage at yahoo.com/security/app-passwords' },
    { value: 'other', label: 'Other / Custom', host: '', port: 587, secure: false },
  ];
  const [form, setForm] = useState({
    host: '', port: 587, secure: false, username: '', password: '',
    imap_host: '', imap_port: 993,
  });

  const chosen = PROVIDERS.find(p => p.value === provider);

  const selectProvider = (val: string) => {
    const p = PROVIDERS.find(x => x.value === val);
    if (!p) return;
    setProvider(val);
    setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure, imap_host: (p as any).imap ?? '', imap_port: (p as any).imap_port ?? 993 }));
    setStep(1);
  };

  const handleConnect = async () => {
    await connectSmtp.mutateAsync({ ...form });
    onClose();
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Select your email provider:</p>
      {PROVIDERS.map(p => (
        <button key={p.value} onClick={() => selectProvider(p.value)}
          className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent text-left transition-colors">
          <span className="font-medium text-sm">{p.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
      <Button variant="outline" className="w-full mt-2" onClick={onClose}>Cancel</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <button onClick={() => setStep(0)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-3 h-3" /> Back
      </button>
      <p className="font-medium text-sm">{chosen?.label ?? 'Custom SMTP'}</p>
      {chosen?.note && (
        <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-700">{chosen.note}</div>
      )}
      <div className="grid gap-3">
        <div>
          <Label className="text-xs">Email address</Label>
          <Input placeholder="you@example.com" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs">Password / App Password</Label>
          <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        {provider === 'other' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">SMTP Host</Label>
                <Input placeholder="smtp.example.com" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">SMTP Port</Label>
                <Input type="number" value={form.port} onChange={e => setForm(f => ({ ...f, port: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">IMAP Host</Label>
                <Input placeholder="imap.example.com" value={form.imap_host} onChange={e => setForm(f => ({ ...f, imap_host: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">IMAP Port</Label>
                <Input type="number" value={form.imap_port} onChange={e => setForm(f => ({ ...f, imap_port: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.secure} onCheckedChange={v => setForm(f => ({ ...f, secure: v }))} id="ssl" />
              <Label htmlFor="ssl" className="text-xs">Use SSL/TLS</Label>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleConnect} disabled={connectSmtp.isPending || !form.username || !form.password}>
          {connectSmtp.isPending ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
    </div>
  );
}

// ─── Facebook Setup Wizard ────────────────────────────────────────────────────

function FacebookWizard({ onClose, connectionId }: { onClose: () => void; connectionId?: string }) {
  const [step, setStep] = useState(connectionId ? 1 : 0);
  const pages = useMetaPages(connectionId ?? '', !!connectionId);
  const subscribePage = useSubscribeMetaPage();
  const [selectedPage, setSelectedPage] = useState('');

  if (step === 0) return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <MessageSquare className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <p className="font-medium text-sm">Connect Facebook Business Account</p>
          <p className="text-xs text-muted-foreground">Grant Steward access to your Facebook Pages to receive Lead Ads and Messenger messages.</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Lead Ad form submissions will automatically create CRM leads</p>
        <p>• Messenger conversations will appear in your inbox</p>
        <p>• Reply to messages directly from Steward</p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button asChild>
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/integrations/meta/connect`}>
            <MessageSquare className="w-4 h-4 mr-2" /> Connect Facebook
          </a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="font-medium text-sm">Select your Facebook Page</p>
      <p className="text-xs text-muted-foreground">Choose the Page whose Lead Ads and Messenger inbox you want to sync.</p>
      <div className="space-y-2">
        {(pages.data ?? []).map(p => (
          <button key={p.id} onClick={() => setSelectedPage(p.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${selectedPage === p.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
            <span className="font-medium text-sm">{p.name}</span>
            {selectedPage === p.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </button>
        ))}
        {pages.data?.length === 0 && <p className="text-sm text-muted-foreground">No pages found. Make sure you granted Pages access during the Facebook sign-in.</p>}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!selectedPage || subscribePage.isPending}
          onClick={async () => {
            if (!connectionId || !selectedPage) return;
            await subscribePage.mutateAsync({ connectionId, pageId: selectedPage });
            onClose();
          }}>
          {subscribePage.isPending ? 'Subscribing...' : 'Activate Page'}
        </Button>
      </div>
    </div>
  );
}

// ─── WhatsApp Setup Wizard ────────────────────────────────────────────────────

function WhatsAppWizard({ onClose }: { onClose: () => void }) {
  const connectWA = useConnectWhatsApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    provider: 'twilio' as 'twilio' | 'meta_whatsapp',
    account_sid: '',
    auth_token: '',
    from_number: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const webhookUrl = `${apiUrl}/webhooks/whatsapp`;

  const steps = [
    {
      title: 'Create a Twilio account',
      content: (
        <div className="space-y-3">
          <p className="text-sm">Steward uses Twilio to send and receive WhatsApp messages.</p>
          <p className="text-sm text-muted-foreground">If you don't have a Twilio account yet, create a free one:</p>
          <Button variant="outline" asChild className="w-full">
            <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Sign up at twilio.com <span className="ml-auto text-xs text-muted-foreground">(free)</span>
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">Already have an account? Click Next.</p>
        </div>
      ),
    },
    {
      title: 'Enter Twilio credentials',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Find these at <strong>console.twilio.com</strong> → Account Info section.</p>
          <div>
            <Label className="text-xs">Account SID</Label>
            <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={form.account_sid} onChange={e => setForm(f => ({ ...f, account_sid: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Auth Token</Label>
            <Input type="password" placeholder="Your Auth Token" value={form.auth_token} onChange={e => setForm(f => ({ ...f, auth_token: e.target.value }))} />
          </div>
        </div>
      ),
    },
    {
      title: 'WhatsApp number',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Use the Twilio sandbox number for testing (<strong>+14155238886</strong>), or a purchased WhatsApp Business number. Include the full number with country code.
          </p>
          <div>
            <Label className="text-xs">WhatsApp From number</Label>
            <Input placeholder="+14155238886" value={form.from_number} onChange={e => setForm(f => ({ ...f, from_number: e.target.value }))} />
          </div>
        </div>
      ),
    },
    {
      title: 'Configure webhook',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            In Twilio Console → Messaging → WhatsApp → Sandbox (or your number), set the <strong>WHEN A MESSAGE COMES IN</strong> webhook URL to:
          </p>
          <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-xs break-all">
            {webhookUrl}
            <Button variant="ghost" size="sm" className="shrink-0 h-6 px-2"
              onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Copied!'); }}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Note on 24-hour window:</strong> WhatsApp only allows you to send freeform messages within 24 hours of a contact's last message. After that, you must use an approved template. Steward will remind you of this when composing a message to an inactive contact.
          </p>
        </div>
      ),
    },
    {
      title: 'Test & connect',
      content: (
        <div className="space-y-3">
          <p className="text-sm">Everything looks good! Click <strong>Connect</strong> to save your credentials and activate WhatsApp messaging.</p>
          <p className="text-xs text-muted-foreground">Send a WhatsApp message to your Twilio number to test — it will appear in your Integrations inbox.</p>
        </div>
      ),
    },
  ];

  const canNext = [
    true,
    form.account_sid.length > 10 && form.auth_token.length > 10,
    form.from_number.length > 5,
    true,
    true,
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {steps.map((s, i) => (
          <span key={i} className={`flex items-center gap-1 ${i === step ? 'text-primary font-medium' : ''}`}>
            {i > 0 && <span>→</span>}
            {i + 1}. {s.title}
          </span>
        ))}
      </div>
      <Separator />
      <div className="min-h-[140px]">{steps[step].content}</div>
      <div className="flex gap-2 justify-end">
        {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>}
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!canNext[step] || (isLast && connectWA.isPending)}
          onClick={async () => {
            if (isLast) {
              await connectWA.mutateAsync(form);
              onClose();
            } else {
              setStep(s => s + 1);
            }
          }}>
          {isLast ? (connectWA.isPending ? 'Connecting...' : 'Connect') : 'Next →'}
        </Button>
      </div>
    </div>
  );
}

// ─── Template Manager ─────────────────────────────────────────────────────────

function TemplateManager() {
  const { data: templates = [] } = useMessageTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', channel: 'whatsapp' as MessageChannel,
    template_name: '', category: 'utility', language: 'en',
    body: '', header_text: '', footer_text: '',
  });

  const handleCreate = async () => {
    await createTemplate.mutateAsync({ ...form });
    setOpen(false);
    setForm({ name: '', channel: 'whatsapp' as MessageChannel, template_name: '', category: 'utility', language: 'en', body: '', header_text: '', footer_text: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Message Templates</h3>
          <p className="text-sm text-muted-foreground">Pre-approved templates for WhatsApp messages outside the 24-hour window.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Template</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label className="text-xs">Name (internal label)</Label>
                <Input placeholder="e.g. Follow-up after meeting" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Channel</Label>
                  <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v as MessageChannel }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utility">Utility</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Template Name (snake_case, no spaces — used in WhatsApp Business Manager)</Label>
                <Input placeholder="follow_up_after_meeting" value={form.template_name} onChange={e => setForm(f => ({ ...f, template_name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))} />
              </div>
              <div>
                <Label className="text-xs">Body — use {`{{1}}`} {`{{2}}`} for variable fields</Label>
                <Textarea rows={4} placeholder="Hi {{1}}, following up on our meeting..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Header (optional, max 60 chars)</Label>
                  <Input maxLength={60} value={form.header_text} onChange={e => setForm(f => ({ ...f, header_text: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Footer (optional, max 60 chars)</Label>
                  <Input maxLength={60} value={form.footer_text} onChange={e => setForm(f => ({ ...f, footer_text: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.name || !form.body || createTemplate.isPending}>
                {createTemplate.isPending ? 'Creating...' : 'Save Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {templates.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">No templates yet. Create one to use when contacting WhatsApp leads after the 24-hour window.</div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{t.body}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{t.channel}</Badge>
                  <Badge variant="outline" className="text-xs">{t.category}</Badge>
                  <Badge variant="outline" className={`text-xs ${t.status === 'approved' ? 'text-green-700' : ''}`}>{t.status}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteTemplate.mutate(t.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page (inner — uses useSearchParams) ────────────────────────────────

function IntegrationsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: connections = [], isLoading } = useMessagingConnections();
  const disconnect = useDisconnectConnection();
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const { data: unreadCount = 0 } = useUnreadMessageCount();
  const markRead = useMarkMessageRead();
  const linkMessage = useLinkMessage();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardChannel, setWizardChannel] = useState<'email' | 'facebook' | 'whatsapp' | null>(null);
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'microsoft' | 'smtp' | null>(null);
  const [linkingMessageId, setLinkingMessageId] = useState<string | null>(null);
  const [linkLeadId, setLinkLeadId] = useState('');

  // After OAuth redirect, open correct wizard to finish setup
  const connected = searchParams.get('connected');
  const metaConn = connections.find(c => c.channel === 'messenger');

  const emailConnections = connections.filter(c => c.channel === 'email');
  const messengerConnections = connections.filter(c => c.channel === 'messenger');
  const whatsappConnections = connections.filter(c => c.channel === 'whatsapp');

  const openWizard = (channel: 'email' | 'facebook' | 'whatsapp') => {
    setWizardChannel(channel);
    setEmailProvider(null);
    setWizardOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect your email, Facebook, and WhatsApp to communicate with leads and clients.</p>
      </div>

      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="inbox" className="relative">
            Inbox
            {unreadCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* ── Connections Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="connections" className="mt-6 space-y-4">
          {/* Email */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Email</CardTitle>
                    <CardDescription className="text-xs">Gmail, Outlook, Zoho, or any SMTP mailbox</CardDescription>
                  </div>
                </div>
                <Button size="sm" onClick={() => openWizard('email')}>
                  <Plus className="w-4 h-4 mr-2" /> Add account
                </Button>
              </div>
            </CardHeader>
            {emailConnections.length > 0 && (
              <CardContent className="pt-0 space-y-2">
                {emailConnections.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="text-sm font-medium">{c.display_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{c.provider}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => disconnect.mutate(c.id)}>
                      <Unplug className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Facebook / Meta */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Facebook</CardTitle>
                    <CardDescription className="text-xs">Lead Ads → CRM + Messenger inbox</CardDescription>
                  </div>
                </div>
                {messengerConnections.length === 0 && (
                  <Button size="sm" onClick={() => openWizard('facebook')}>
                    <Plus className="w-4 h-4 mr-2" /> Connect
                  </Button>
                )}
              </div>
            </CardHeader>
            {messengerConnections.length > 0 && (
              <CardContent className="pt-0 space-y-2">
                {messengerConnections.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="text-sm font-medium">{c.display_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!(c.config as any)?.selected_page_id && (
                        <Button variant="outline" size="sm" onClick={() => {
                          setWizardChannel('facebook');
                          setWizardOpen(true);
                        }}>Select Page</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => disconnect.mutate(c.id)}>
                        <Unplug className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 border border-green-100">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">WhatsApp</CardTitle>
                    <CardDescription className="text-xs">Send and receive WhatsApp messages via Twilio</CardDescription>
                  </div>
                </div>
                {whatsappConnections.length === 0 && (
                  <Button size="sm" onClick={() => openWizard('whatsapp')}>
                    <Plus className="w-4 h-4 mr-2" /> Set up
                  </Button>
                )}
              </div>
            </CardHeader>
            {whatsappConnections.length > 0 && (
              <CardContent className="pt-0 space-y-2">
                {whatsappConnections.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="text-sm font-medium">{c.display_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{c.provider}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => disconnect.mutate(c.id)}>
                      <Unplug className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ── Inbox Tab ───────────────────────────────────────────────────────── */}
        <TabsContent value="inbox" className="mt-6 space-y-3">
          {messagesLoading ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">Connect your email, Facebook, or WhatsApp to start receiving messages here.</p>
            </div>
          ) : (
            messages.map(msg => (
              <MessageItem
                key={msg.id}
                msg={msg}
                onMarkRead={(id) => markRead.mutate(id)}
                onLink={(id) => setLinkingMessageId(id)}
              />
            ))
          )}
        </TabsContent>

        {/* ── Templates Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="templates" className="mt-6">
          <TemplateManager />
        </TabsContent>
      </Tabs>

      {/* ── Setup Wizard Dialog ──────────────────────────────────────────────── */}
      <Dialog open={wizardOpen} onOpenChange={v => { setWizardOpen(v); if (!v) { setWizardChannel(null); setEmailProvider(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {wizardChannel === 'email' && (emailProvider ? `Connect ${emailProvider === 'gmail' ? 'Gmail' : emailProvider === 'microsoft' ? 'Microsoft 365' : 'Email (SMTP)'}` : 'Add Email Account')}
              {wizardChannel === 'facebook' && 'Connect Facebook'}
              {wizardChannel === 'whatsapp' && 'Set up WhatsApp'}
            </DialogTitle>
          </DialogHeader>

          {/* Email: first choose provider */}
          {wizardChannel === 'email' && !emailProvider && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">How would you like to connect your email?</p>
              {([
                { id: 'gmail', label: 'Gmail', desc: 'Recommended — one-click OAuth' },
                { id: 'microsoft', label: 'Outlook / Microsoft 365', desc: 'OAuth — Office 365 and Exchange Online' },
                { id: 'smtp', label: 'Other (Zoho, Hostinger, Yahoo…)', desc: 'IMAP/SMTP with email + password' },
              ] as const).map(p => (
                <button key={p.id} onClick={() => setEmailProvider(p.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent text-left transition-colors">
                  <div>
                    <p className="font-medium text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setWizardOpen(false)}>Cancel</Button>
            </div>
          )}

          {wizardChannel === 'email' && emailProvider === 'gmail' && (
            <GmailWizard onClose={() => setWizardOpen(false)} />
          )}
          {wizardChannel === 'email' && emailProvider === 'microsoft' && (
            <MicrosoftWizard onClose={() => setWizardOpen(false)} />
          )}
          {wizardChannel === 'email' && emailProvider === 'smtp' && (
            <SmtpWizard onClose={() => setWizardOpen(false)} />
          )}
          {wizardChannel === 'facebook' && (
            <FacebookWizard
              onClose={() => setWizardOpen(false)}
              connectionId={metaConn?.id}
            />
          )}
          {wizardChannel === 'whatsapp' && (
            <WhatsAppWizard onClose={() => setWizardOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Link Message Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!linkingMessageId} onOpenChange={v => !v && setLinkingMessageId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Link to CRM Lead</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Enter the Lead ID to link this message to a CRM contact.</p>
            <Input placeholder="Lead UUID" value={linkLeadId} onChange={e => setLinkLeadId(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLinkingMessageId(null)}>Cancel</Button>
            <Button
              disabled={!linkLeadId || linkMessage.isPending}
              onClick={async () => {
                if (!linkingMessageId) return;
                await linkMessage.mutateAsync({ id: linkingMessageId, lead_id: linkLeadId });
                setLinkingMessageId(null);
                setLinkLeadId('');
              }}>
              {linkMessage.isPending ? 'Linking...' : 'Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <IntegrationsPageInner />
    </Suspense>
  );
}
