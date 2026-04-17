'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, DollarSign, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/format';

const COLORS = ['#003B43', '#D8CFB7', '#10b981', '#f59e0b', '#ef4444', '#006B78', '#8b5cf6', '#1F2A2D'];

export function PipelineChart({ data }: { data: { name: string; leads: number; value: number }[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Sales Pipeline</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/crm">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                formatter={(value: number) => [value, 'Leads']}
              />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
            <Target className="h-8 w-8 mb-2" />
            <p className="text-sm">No pipeline data yet</p>
            <Button asChild size="sm" variant="link"><Link href="/crm">Add your first lead</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ byType }: { byType?: Record<string, number> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Revenue Breakdown</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/commissions">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {byType && Object.keys(byType).length > 0 ? (
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={Object.entries(byType).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: value as number }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value"
                >
                  {Object.keys(byType).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {Object.entries(byType).map(([type, amount], i) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <DollarSign className="h-8 w-8 mb-2" />
            <p className="text-sm">No commission data yet</p>
            <Button asChild size="sm" variant="link"><Link href="/commissions">Record a commission</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
