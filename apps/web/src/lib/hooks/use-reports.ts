import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface PortfolioReportData {
  advisorName: string;
  firmName: string;
  fspNumber?: string;
  logoUrl?: string;
  primaryColour?: string;
  clientName: string;
  date: string;
  screening: any;
}

export interface ReportResult {
  html: string;
  message: string;
}

export function useGeneratePortfolioReport() {
  return useMutation({
    mutationFn: async (data: PortfolioReportData) => {
      const { data: result } = await api.post<ReportResult>('/reports/portfolio', data);
      return result;
    },
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report');
    },
  });
}
