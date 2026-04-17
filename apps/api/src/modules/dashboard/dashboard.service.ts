import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly ds: DataSource) {}

  async getSummary(advisorId: string) {
    const [
      clientCount,
      fundCount,
      portfolioAgg,
      pipeline,
      tasks,
      commissionSummary,
      advisoryStats,
      complianceStats,
    ] = await Promise.all([
      this.ds.query(
        `SELECT COUNT(*)::int AS count FROM client WHERE advisor_id = $1`,
        [advisorId],
      ),
      this.ds.query(`SELECT COUNT(*)::int AS count FROM funds`),
      this.ds.query(
        `SELECT COUNT(*)::int AS count, COALESCE(SUM(total_value), 0)::float AS total_aum
         FROM portfolio p
         JOIN client c ON p.client_id = c.id
         WHERE c.advisor_id = $1`,
        [advisorId],
      ),
      this.ds.query(
        `SELECT stage, COUNT(*)::int AS count, COALESCE(SUM(expected_value), 0)::float AS total_value
         FROM lead WHERE advisor_id = $1
         GROUP BY stage ORDER BY stage`,
        [advisorId],
      ),
      this.ds.query(
        `SELECT id, title, priority, due_date, completed_at
         FROM task WHERE advisor_id = $1 AND completed_at IS NULL
         ORDER BY due_date ASC NULLS LAST LIMIT 5`,
        [advisorId],
      ),
      this.ds.query(
        `SELECT
           COALESCE(SUM(CASE WHEN status = 'received' THEN amount ELSE 0 END), 0)::float AS "totalReceived",
           COALESCE(SUM(CASE WHEN status = 'expected' THEN amount ELSE 0 END), 0)::float AS "totalExpected",
           COALESCE(SUM(CASE WHEN status = 'received' THEN vat_amount ELSE 0 END), 0)::float AS "totalVAT"
         FROM commission WHERE advisor_id = $1`,
        [advisorId],
      ),
      this.ds.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
           COUNT(*) FILTER (WHERE priority = 'critical')::int AS critical,
           COUNT(*) FILTER (WHERE status = 'implemented')::int AS implemented
         FROM advisory_recommendation
         WHERE client_id IN (SELECT id FROM client WHERE advisor_id = $1)`,
        [advisorId],
      ),
      this.ds.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'pending' OR status = 'in_progress')::int AS "pendingReviews",
           COUNT(*) FILTER (WHERE next_review_date < NOW())::int AS "overdueReviews",
           COUNT(*) FILTER (WHERE next_review_date BETWEEN NOW() AND NOW() + INTERVAL '30 days')::int AS "reviewsDue30Days"
         FROM compliance_review
         WHERE advisor_id = $1`,
        [advisorId],
      ),
    ]);

    // Build commission byType breakdown
    const commByType = await this.ds.query(
      `SELECT commission_type, COALESCE(SUM(amount), 0)::float AS total
       FROM commission WHERE advisor_id = $1 AND status = 'received'
       GROUP BY commission_type`,
      [advisorId],
    );
    const byType: Record<string, number> = {};
    for (const row of commByType) {
      byType[row.commission_type] = row.total;
    }

    return {
      clients: { count: clientCount[0]?.count || 0 },
      funds: { count: fundCount[0]?.count || 0 },
      portfolios: {
        count: portfolioAgg[0]?.count || 0,
        totalAUM: portfolioAgg[0]?.total_aum || 0,
      },
      pipeline,
      tasks,
      commissions: {
        totalReceived: commissionSummary[0]?.totalReceived || 0,
        totalExpected: commissionSummary[0]?.totalExpected || 0,
        totalVAT: commissionSummary[0]?.totalVAT || 0,
        byType,
      },
      advisory: advisoryStats[0] || { total: 0, pending: 0, critical: 0, implemented: 0 },
      compliance: {
        pendingReviews: complianceStats[0]?.pendingReviews || 0,
        overdueReviews: complianceStats[0]?.overdueReviews || 0,
        reviewsDue30Days: complianceStats[0]?.reviewsDue30Days || 0,
        openConflicts: 0,
        upcomingReturns: 0,
      },
    };
  }
}
