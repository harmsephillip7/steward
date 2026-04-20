'use client';

import dynamic from 'next/dynamic';
import { Document, Page, Text, View, StyleSheet, Font, Image, pdf } from '@react-pdf/renderer';
import type { ProposalProduct } from '@steward/shared';
import { PRODUCT_TYPE_LABELS } from '@steward/shared';

export interface ProposalPdfData {
  title: string;
  products: ProposalProduct[];
  cover_letter?: string;
  notes?: string;
  total_monthly_premium: number;
  total_lump_sum: number;
  valid_until?: string;
  disclaimer?: string;
  advisor?: {
    name: string;
    firm_name: string;
    fsp_number?: string;
    logo_url?: string;
    primary_colour_hex?: string;
  };
  client?: { first_name: string; last_name: string; email?: string };
  lead?: { first_name: string; last_name: string; email?: string };
}

const fmt = (n?: number) => (n ? `R ${n.toLocaleString('en-ZA')}` : '—');

function makeStyles(brandColour: string) {
  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 2, borderBottomColor: brandColour, paddingBottom: 12 },
    headerLeft: {},
    headerRight: { textAlign: 'right', fontSize: 9, color: '#777' },
    logo: { height: 36, marginBottom: 6, objectFit: 'contain' as any },
    title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: brandColour },
    subtitle: { fontSize: 9, color: '#777', marginTop: 4 },
    sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: brandColour, marginTop: 16, marginBottom: 6 },
    text: { fontSize: 10, lineHeight: 1.5, color: '#444' },
    productCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, marginBottom: 8 },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    productName: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    productType: { fontSize: 8, color: '#777' },
    productAmount: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1 },
    rowLabel: { fontSize: 9, color: '#777' },
    rowValue: { fontSize: 9 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tableTotalRow: { flexDirection: 'row', padding: 6, backgroundColor: '#f5f5f5', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
    tableCell: { flex: 1, fontSize: 9 },
    tableCellRight: { flex: 1, fontSize: 9, textAlign: 'right' },
    tableCellBold: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold' },
    tableCellBoldRight: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
    disclaimer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
    disclaimerTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#999' },
    disclaimerText: { fontSize: 7, color: '#aaa', lineHeight: 1.4 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#bbb', borderTopWidth: 1, borderTopColor: brandColour, paddingTop: 6 },
  });
}

function mergeLetter(text: string, data: ProposalPdfData) {
  const recipient = data.client || data.lead;
  return text
    .replace(/\{\{client_name\}\}/g, recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Client')
    .replace(/\{\{advisor_name\}\}/g, data.advisor?.name || 'Advisor')
    .replace(/\{\{firm_name\}\}/g, data.advisor?.firm_name || 'Firm')
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-ZA'));
}

function ProductDetail({ label, value, styles }: { label: string; value: string | number; styles: any }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{typeof value === 'number' ? fmt(value) : value}</Text>
    </View>
  );
}

export function ProposalPdfDocument({ data }: { data: ProposalPdfData }) {
  const brandColour = data.advisor?.primary_colour_hex || '#1a1a2e';
  const styles = makeStyles(brandColour);
  const recipient = data.client || data.lead;
  const logoUrl = data.advisor?.logo_url
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${process.env.NEXT_PUBLIC_API_URL || ''}${data.advisor.logo_url}`
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.subtitle}>
              Prepared for: {recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Client'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text>{data.advisor?.firm_name || 'Your Firm'}</Text>
            {data.advisor?.fsp_number && <Text>FSP {data.advisor.fsp_number}</Text>}
            <Text>{new Date().toLocaleDateString('en-ZA')}</Text>
            {data.valid_until && <Text>Valid until: {new Date(data.valid_until).toLocaleDateString('en-ZA')}</Text>}
          </View>
        </View>

        {/* Cover Letter */}
        {data.cover_letter && (
          <View>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <Text style={styles.text}>{mergeLetter(data.cover_letter, data)}</Text>
          </View>
        )}

        {/* Products */}
        {data.products.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Product Details</Text>
            {data.products.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View>
                    <Text style={styles.productName}>{p.product_name || PRODUCT_TYPE_LABELS[p.type]}</Text>
                    <Text style={styles.productType}>{PRODUCT_TYPE_LABELS[p.type]} • {p.provider || 'Provider TBC'}</Text>
                  </View>
                  {(p.premium_monthly || p.monthly_contribution) && (
                    <Text style={styles.productAmount}>{fmt(p.premium_monthly || p.monthly_contribution)}/pm</Text>
                  )}
                </View>
                {p.cover_amount != null && <ProductDetail label="Cover Amount" value={p.cover_amount} styles={styles} />}
                {p.lump_sum != null && <ProductDetail label="Lump Sum" value={p.lump_sum} styles={styles} />}
                {p.term_years != null && <ProductDetail label="Term" value={`${p.term_years} years`} styles={styles} />}
                {p.escalation_rate != null && <ProductDetail label="Escalation" value={`${p.escalation_rate}%`} styles={styles} />}
                {p.waiting_period && <ProductDetail label="Waiting Period" value={p.waiting_period} styles={styles} />}
                {p.payment_pattern && <ProductDetail label="Payment Pattern" value={p.payment_pattern} styles={styles} />}
                {p.initial_contribution != null && <ProductDetail label="Initial Contribution" value={p.initial_contribution} styles={styles} />}
                {p.platform && <ProductDetail label="Platform" value={p.platform} styles={styles} />}
                {p.fund_selection?.length ? <ProductDetail label="Funds" value={p.fund_selection.join(', ')} styles={styles} /> : null}
                {p.plan_name && <ProductDetail label="Plan" value={p.plan_name} styles={styles} />}
                {p.dependents_covered != null && <ProductDetail label="Dependents" value={p.dependents_covered} styles={styles} />}
                {p.gap_cover_included && <ProductDetail label="Gap Cover" value="Included" styles={styles} />}
                {p.insured_item && <ProductDetail label="Insured Item" value={p.insured_item} styles={styles} />}
                {p.sum_insured != null && <ProductDetail label="Sum Insured" value={p.sum_insured} styles={styles} />}
                {p.excess != null && <ProductDetail label="Excess" value={p.excess} styles={styles} />}
                {p.notes && <Text style={{ fontSize: 8, color: '#888', marginTop: 4, fontStyle: 'italic' }}>{p.notes}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Cost Summary */}
        <View>
          <Text style={styles.sectionTitle}>Cost Summary</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellBold}>Description</Text>
            <Text style={styles.tableCellBoldRight}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Monthly Premium</Text>
            <Text style={styles.tableCellRight}>{fmt(data.total_monthly_premium)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Lump Sum</Text>
            <Text style={styles.tableCellRight}>{fmt(data.total_lump_sum)}</Text>
          </View>
          <View style={styles.tableTotalRow}>
            <Text style={styles.tableCellBold}>Annual Premium</Text>
            <Text style={styles.tableCellBoldRight}>{fmt(data.total_monthly_premium * 12)}</Text>
          </View>
        </View>

        {/* Disclaimer */}
        {data.disclaimer && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>{data.disclaimer}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            {data.advisor?.firm_name || 'Your Firm'} {data.advisor?.fsp_number ? `| FSP ${data.advisor.fsp_number}` : ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadProposalPdf(data: ProposalPdfData) {
  const blob = await pdf(<ProposalPdfDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
