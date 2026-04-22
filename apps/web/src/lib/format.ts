import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function relativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();

  if (diffMs < 60_000) return 'just now';
  if (diffMs < 86_400_000) return formatDistanceToNow(d, { addSuffix: true });
  if (isToday(d)) return `today at ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `yesterday at ${format(d, 'HH:mm')}`;
  if (diffMs < 7 * 86_400_000) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, 'dd MMM yyyy');
}

export function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '—';
  return `R\u00a0${n.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function enumLabel(val?: string): string {
  if (!val) return '—';
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = row[h] ?? '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
