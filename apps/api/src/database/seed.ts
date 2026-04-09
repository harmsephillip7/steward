/**
 * Steward — Comprehensive Database Seed Script
 *
 * Populates the database with realistic South African advisory practice data.
 * Run from repo root:  npx ts-node -P apps/api/tsconfig.json apps/api/src/database/seed.ts
 */

import { Client as PgClient } from 'pg';
import * as bcrypt from 'bcrypt';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://steward:steward_dev@localhost:5432/steward_dev';

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}
function pastDate(yearsBack: number, monthsBack = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsBack);
  d.setMonth(d.getMonth() - monthsBack);
  return d.toISOString().split('T')[0];
}
function dob(age: number): string {
  return pastDate(age, Math.floor(Math.random() * 12));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  const db = new PgClient({ connectionString: DATABASE_URL });
  await db.connect();
  console.log('✅ Connected to database');

  try {
    await db.query('BEGIN');

    // ── 1. Find the admin advisor ─────────────────────────────────────────
    const advisorRes = await db.query(
      `SELECT id FROM advisors WHERE email = 'admin@steward.app' LIMIT 1`,
    );
    if (!advisorRes.rows.length) {
      throw new Error('Admin advisor not found. Please register first at POST /auth/register');
    }
    const advisorId: string = advisorRes.rows[0].id;
    console.log(`✅ Using advisor: ${advisorId}`);

    // ── 2. Upsert extra advisors ──────────────────────────────────────────
    const advisorsToCreate = [
      {
        name: 'Sarah van der Merwe',
        email: 'sarah@steward.app',
        firm_name: 'Steward Advisory',
        fsp_number: 'FSP-44221',
      },
    ];
    const advisorIds: string[] = [advisorId];
    for (const a of advisorsToCreate) {
      const exists = await db.query(`SELECT id FROM advisors WHERE email = $1`, [a.email]);
      if (exists.rows.length) {
        advisorIds.push(exists.rows[0].id);
      } else {
        const hash = await bcrypt.hash('Steward@2026', 12);
        const r = await db.query(
          `INSERT INTO advisors (name, email, password_hash, firm_name, fsp_number, is_active)
           VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
          [a.name, a.email, hash, a.firm_name, a.fsp_number],
        );
        advisorIds.push(r.rows[0].id);
        console.log(`✅ Created advisor: ${a.name}`);
      }
    }

    // ── 3. Clear existing seed data (safe re-run) ─────────────────────────
    // Only clear if re-running (check for seeded marker in fund names)
    const seedCheck = await db.query(
      `SELECT id FROM funds WHERE name = 'Coronation Balanced Plus Fund' LIMIT 1`,
    );
    if (seedCheck.rows.length) {
      console.log('⚠️  Seed data already exists — clearing and re-seeding...');
      await db.query(`DELETE FROM category_exposures WHERE screening_result_id IN (SELECT id FROM screening_results WHERE portfolio_id IN (SELECT id FROM portfolios WHERE client_id IN (SELECT id FROM clients WHERE advisor_id = ANY($1::uuid[]))))`, [advisorIds]);
      await db.query(`DELETE FROM screening_results WHERE portfolio_id IN (SELECT id FROM portfolios WHERE client_id IN (SELECT id FROM clients WHERE advisor_id = ANY($1::uuid[])))`, [advisorIds]);
      await db.query(`DELETE FROM portfolio_funds WHERE portfolio_id IN (SELECT id FROM portfolios WHERE client_id IN (SELECT id FROM clients WHERE advisor_id = ANY($1::uuid[])))`, [advisorIds]);
      await db.query(`DELETE FROM portfolios WHERE client_id IN (SELECT id FROM clients WHERE advisor_id = ANY($1::uuid[]))`, [advisorIds]);
      await db.query(`DELETE FROM records_of_advice WHERE advisor_id = ANY($1::uuid[])`, [advisorIds]);
      await db.query(`DELETE FROM financial_plans WHERE advisor_id = ANY($1::uuid[])`, [advisorIds]);
      await db.query(`DELETE FROM clients WHERE advisor_id = ANY($1::uuid[])`, [advisorIds]);
      await db.query(`DELETE FROM compromise_flags WHERE holding_id IN (SELECT id FROM holdings WHERE fund_id IN (SELECT id FROM funds WHERE name = 'Coronation Balanced Plus Fund' OR provider IS NOT NULL))`);
      await db.query(`DELETE FROM holdings WHERE fund_id IN (SELECT id FROM funds WHERE provider IS NOT NULL)`);
      await db.query(`DELETE FROM funds WHERE provider IS NOT NULL`);
      console.log('✅ Cleared previous seed data');
    }

    // ── 4. Create Funds ───────────────────────────────────────────────────
    const fundsData = [
      // South African funds — faith & ESG screened
      { name: 'Coronation Balanced Plus Fund', isin: 'ZAE000111101', provider: 'Coronation Fund Managers', asset_class: 'multi_asset', region: 'SA', ter: 1.27, benchmark: 'CPI + 5%', inception_date: '2001-04-01' },
      { name: 'Allan Gray Balanced Fund', isin: 'ZAE000111102', provider: 'Allan Gray', asset_class: 'multi_asset', region: 'SA', ter: 1.55, benchmark: 'CPI + 5%', inception_date: '1999-10-01' },
      { name: 'Ninety One Opportunity Fund', isin: 'ZAE000111103', provider: 'Ninety One', asset_class: 'multi_asset', region: 'SA', ter: 1.42, benchmark: 'ASISA Multi-Asset High Equity', inception_date: '2005-03-15' },
      { name: 'Sanlam Investment Core SA Equity Fund', isin: 'ZAE000111104', provider: 'Sanlam Investment Management', asset_class: 'equity', region: 'SA', ter: 0.82, benchmark: 'FTSE/JSE All Share Index', inception_date: '2008-07-01' },
      { name: 'Old Mutual Global Equity Fund', isin: 'ZAE000111105', provider: 'Old Mutual Multi-Managers', asset_class: 'equity', region: 'global', ter: 1.10, benchmark: 'MSCI World Index', inception_date: '2010-01-01' },
      { name: 'Fairtree Fixed Income Prescient Fund', isin: 'ZAE000111106', provider: 'Fairtree', asset_class: 'bond', region: 'SA', ter: 0.55, benchmark: 'STEFI Composite', inception_date: '2015-06-01' },
      { name: 'Stanlib SA Property Fund', isin: 'ZAE000111107', provider: 'Stanlib', asset_class: 'property', region: 'SA', ter: 0.90, benchmark: 'FTSE/JSE SA Listed Property', inception_date: '2003-11-01' },
      { name: 'Brenthurst Preferred Income Fund', isin: 'ZAE000111108', provider: 'Brenthurst Wealth', asset_class: 'bond', region: 'SA', ter: 0.65, benchmark: 'STeFI + 1%', inception_date: '2012-02-01' },
      { name: 'Prescient Money Market Fund', isin: 'ZAE000111109', provider: 'Prescient Investment Management', asset_class: 'cash', region: 'SA', ter: 0.21, benchmark: 'STeFI Call Rate', inception_date: '2000-09-01' },
      { name: 'Camissa Asset Management Equity Fund', isin: 'ZAE000111110', provider: 'Camissa Asset Management', asset_class: 'equity', region: 'SA', ter: 0.95, benchmark: 'FTSE/JSE Capped SWIX', inception_date: '2014-01-01' },
      { name: 'Nitrogen Fund Managers Core Bond Fund', isin: 'ZAE000111111', provider: 'Nitrogen Fund Managers', asset_class: 'bond', region: 'SA', ter: 0.48, benchmark: 'ALBI', inception_date: '2018-03-01' },
      { name: 'Foord Global Equity Feeder Fund', isin: 'ZAE000111112', provider: 'Foord Asset Management', asset_class: 'equity', region: 'global', ter: 1.30, benchmark: 'MSCI ACWI', inception_date: '2007-05-01' },
    ];

    const fundIdMap: Record<string, string> = {};
    for (const f of fundsData) {
      const r = await db.query(
        `INSERT INTO funds (isin, name, provider, asset_class, region, ter, benchmark, inception_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [f.isin, f.name, f.provider, f.asset_class, f.region, f.ter, f.benchmark, f.inception_date],
      );
      fundIdMap[f.name] = r.rows[0].id;
    }
    console.log(`✅ Created ${fundsData.length} funds`);

    // ── 5. Create Holdings + Compromise Flags ────────────────────────────
    // Holdings per fund — a mix of SA companies with some flagged
    const holdingsData: Record<string, { company: string; isin: string; weight: number; sector: string; country: string; flags?: string[] }[]> = {
      'Coronation Balanced Plus Fund': [
        { company: 'Naspers Ltd', isin: 'ZAE000015889', weight: 8.50, sector: 'Technology', country: 'ZA' },
        { company: 'FirstRand Ltd', isin: 'ZAE000066552', weight: 7.20, sector: 'Financials', country: 'ZA' },
        { company: 'Prosus NV', isin: 'NL0013654783', weight: 6.30, sector: 'Technology', country: 'NL' },
        { company: 'Standard Bank Group', isin: 'ZAE000109815', weight: 5.80, sector: 'Financials', country: 'ZA' },
        { company: 'Anglo American Plc', isin: 'GB00B1XZS820', weight: 5.10, sector: 'Mining', country: 'ZA' },
        { company: 'Sasol Ltd', isin: 'ZAE000006896', weight: 4.20, sector: 'Energy', country: 'ZA' },
        { company: 'ABI (SA) Ltd', isin: 'ZAE000191348', weight: 3.50, sector: 'Alcohol & Beverages', country: 'ZA', flags: ['alcohol'] },
        { company: 'British American Tobacco PLC', isin: 'GB0002875804', weight: 2.80, sector: 'Consumer Staples', country: 'GB', flags: ['tobacco'] },
        { company: 'MTN Group Ltd', isin: 'ZAE000042164', weight: 4.60, sector: 'Telecoms', country: 'ZA' },
        { company: 'Capitec Bank Holdings', isin: 'ZAE000035861', weight: 3.90, sector: 'Financials', country: 'ZA' },
      ],
      'Allan Gray Balanced Fund': [
        { company: 'Glencore PLC', isin: 'JE00B4T3BW64', weight: 9.10, sector: 'Mining', country: 'ZA' },
        { company: 'Murphy Oil Corporation', isin: 'US6267171022', weight: 6.80, sector: 'Energy', country: 'US' },
        { company: 'Remgro Ltd', isin: 'ZAE000026480', weight: 5.50, sector: 'Diversified', country: 'ZA' },
        { company: 'Old Mutual Ltd', isin: 'ZAE000255360', weight: 5.20, sector: 'Financials', country: 'ZA' },
        { company: 'Absa Group Ltd', isin: 'ZAE000255360', weight: 4.90, sector: 'Financials', country: 'ZA' },
        { company: 'Tiger Brands Ltd', isin: 'ZAE000071080', weight: 4.30, sector: 'Consumer Goods', country: 'ZA' },
        { company: 'Sun International Ltd', isin: 'ZAE000097580', weight: 3.10, sector: 'Gambling & Leisure', country: 'ZA', flags: ['gambling'] },
        { company: 'Philip Morris International', isin: 'US7181721090', weight: 2.40, sector: 'Consumer Staples', country: 'US', flags: ['tobacco'] },
        { company: 'Shoprite Holdings', isin: 'ZAE000012084', weight: 5.70, sector: 'Retail', country: 'ZA' },
        { company: 'Pick n Pay Stores', isin: 'ZAE000005443', weight: 3.20, sector: 'Retail', country: 'ZA' },
      ],
      'Ninety One Opportunity Fund': [
        { company: 'BHP Group Ltd', isin: 'AU000000BHP4', weight: 8.90, sector: 'Mining', country: 'ZA' },
        { company: 'Nedbank Group', isin: 'ZAE000004875', weight: 6.40, sector: 'Financials', country: 'ZA' },
        { company: 'Vodacom Group', isin: 'ZAE000132577', weight: 5.80, sector: 'Telecoms', country: 'ZA' },
        { company: 'Sanlam Ltd', isin: 'ZAE000070660', weight: 5.30, sector: 'Financials', country: 'ZA' },
        { company: 'Discovery Ltd', isin: 'ZAE000022331', weight: 4.70, sector: 'Financials', country: 'ZA' },
        { company: 'Distell Group Holdings', isin: 'ZAE000028668', weight: 3.80, sector: 'Beverages', country: 'ZA', flags: ['alcohol'] },
        { company: 'Gold Fields Ltd', isin: 'ZAE000018123', weight: 4.50, sector: 'Mining', country: 'ZA' },
        { company: 'AngloGold Ashanti', isin: 'ZAE000043485', weight: 4.10, sector: 'Mining', country: 'ZA' },
        { company: 'Woolworths Holdings', isin: 'ZAE000063863', weight: 3.60, sector: 'Retail', country: 'ZA' },
        { company: 'Mr Price Group', isin: 'ZAE000200457', weight: 3.20, sector: 'Retail', country: 'ZA' },
      ],
      'Sanlam Investment Core SA Equity Fund': [
        { company: 'Naspers Ltd', isin: 'ZAE000015889', weight: 12.30, sector: 'Technology', country: 'ZA' },
        { company: 'FirstRand Ltd', isin: 'ZAE000066552', weight: 9.80, sector: 'Financials', country: 'ZA' },
        { company: 'Standard Bank Group', isin: 'ZAE000109815', weight: 8.50, sector: 'Financials', country: 'ZA' },
        { company: 'Anglo American Plc', isin: 'GB00B1XZS820', weight: 7.20, sector: 'Mining', country: 'ZA' },
        { company: 'Capitec Bank Holdings', isin: 'ZAE000035861', weight: 6.10, sector: 'Financials', country: 'ZA' },
        { company: 'MTN Group Ltd', isin: 'ZAE000042164', weight: 5.80, sector: 'Telecoms', country: 'ZA' },
        { company: 'Clicks Group Ltd', isin: 'ZAE000134854', weight: 4.30, sector: 'Healthcare', country: 'ZA' },
        { company: 'Bidvest Group', isin: 'ZAE000117321', weight: 4.10, sector: 'Diversified', country: 'ZA' },
      ],
      'Old Mutual Global Equity Fund': [
        { company: 'Microsoft Corporation', isin: 'US5949181045', weight: 8.20, sector: 'Technology', country: 'US' },
        { company: 'Apple Inc', isin: 'US0378331005', weight: 7.80, sector: 'Technology', country: 'US' },
        { company: 'NVIDIA Corporation', isin: 'US67066G1040', weight: 6.50, sector: 'Technology', country: 'US' },
        { company: 'Amazon.com Inc', isin: 'US0231351067', weight: 5.90, sector: 'Technology', country: 'US' },
        { company: 'Alphabet Inc (Class A)', isin: 'US02079K3059', weight: 5.30, sector: 'Technology', country: 'US' },
        { company: 'Nestlé SA', isin: 'CH0038863350', weight: 4.20, sector: 'Consumer Goods', country: 'CH' },
        { company: 'LVMH Moët Hennessy', isin: 'FR0000121014', weight: 3.80, sector: 'Luxury Goods', country: 'FR', flags: ['alcohol'] },
        { company: 'Diageo PLC', isin: 'GB0002374006', weight: 3.10, sector: 'Beverages', country: 'GB', flags: ['alcohol'] },
        { company: 'UnitedHealth Group', isin: 'US91324P1021', weight: 4.50, sector: 'Healthcare', country: 'US' },
        { company: 'Berkshire Hathaway B', isin: 'US0846707026', weight: 3.70, sector: 'Financials', country: 'US' },
      ],
      'Fairtree Fixed Income Prescient Fund': [
        { company: 'RSA Government Bond 2032', isin: 'ZAG000178970', weight: 18.50, sector: 'Sovereign Bonds', country: 'ZA' },
        { company: 'RSA Government Bond 2030', isin: 'ZAG000178971', weight: 15.20, sector: 'Sovereign Bonds', country: 'ZA' },
        { company: 'FirstRand Bank Corporate Bond', isin: 'ZAG000123401', weight: 8.30, sector: 'Financial Bonds', country: 'ZA' },
        { company: 'Standard Bank Corp Bond', isin: 'ZAG000123402', weight: 7.80, sector: 'Financial Bonds', country: 'ZA' },
        { company: 'Eskom Holdings SOC Bond', isin: 'ZAG000001234', weight: 6.10, sector: 'Government Enterprise', country: 'ZA' },
        { company: 'SANRAL Bond', isin: 'ZAG000001235', weight: 5.40, sector: 'Government Enterprise', country: 'ZA' },
        { company: 'MTN Group Bond', isin: 'ZAG000001236', weight: 4.90, sector: 'Corporate Bonds', country: 'ZA' },
        { company: 'Absa Corporate Bond', isin: 'ZAG000123403', weight: 6.50, sector: 'Financial Bonds', country: 'ZA' },
      ],
    };

    let holdingCount = 0;
    let flagCount = 0;
    for (const [fundName, holdings] of Object.entries(holdingsData)) {
      const fundId = fundIdMap[fundName];
      if (!fundId) continue;
      for (const h of holdings) {
        const hr = await db.query(
          `INSERT INTO holdings (fund_id, company_name, isin, weight_pct, sector, country, is_fund)
           VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING id`,
          [fundId, h.company, h.isin, h.weight, h.sector, h.country],
        );
        holdingCount++;
        const holdingId = hr.rows[0].id;
        if (h.flags) {
          for (const category of h.flags) {
            await db.query(
              `INSERT INTO compromise_flags (holding_id, category, confidence_score, flagged_by, notes)
               VALUES ($1,$2,$3,'ai',$4)`,
              [holdingId, category, randomBetween(0.80, 0.98, 2), `AI-detected ${category} exposure via company activity analysis`],
            );
            flagCount++;
          }
        }
      }
    }
    console.log(`✅ Created ${holdingCount} holdings, ${flagCount} compromise flags`);

    // ── 6. Create Clients ─────────────────────────────────────────────────
    const clientsData = [
      { first_name: 'Pieter', last_name: 'du Plessis', id_number: '7803125043081', tax_number: 'TN73821001', dob: '1978-03-12', risk_profile: 'moderate_aggressive', kyc: true, fica: true, sow: true, rpc: true, phone: '0821234567', email: 'pieter.duplessis@gmail.com', adv: advisorId },
      { first_name: 'Anél', last_name: 'Coetzee', id_number: '8505154213080', tax_number: 'TN73821002', dob: '1985-05-15', risk_profile: 'moderate', kyc: true, fica: true, sow: true, rpc: true, phone: '0831234568', email: 'anel.coetzee@outlook.com', adv: advisorId },
      { first_name: 'Johan', last_name: 'Botha', id_number: '6911285085087', tax_number: 'TN73821003', dob: '1969-11-28', risk_profile: 'conservative', kyc: true, fica: true, sow: false, rpc: true, phone: '0841234569', email: 'j.botha@mweb.co.za', adv: advisorId },
      { first_name: 'Thabo', last_name: 'Nkosi', id_number: '9002107654082', tax_number: 'TN73821004', dob: '1990-02-10', risk_profile: 'aggressive', kyc: true, fica: false, sow: false, rpc: false, phone: '0611234570', email: 'thabo.nkosi@icloud.com', adv: advisorId },
      { first_name: 'Zanele', last_name: 'Dlamini', id_number: '8810204321085', tax_number: 'TN73821005', dob: '1988-10-20', risk_profile: 'moderate_conservative', kyc: true, fica: true, sow: true, rpc: true, phone: '0731234571', email: 'zanele.dlamini@gmail.com', adv: advisorId },
      { first_name: 'Gerrit', last_name: 'van Rensburg', id_number: '6504153214089', tax_number: 'TN73821006', dob: '1965-04-15', risk_profile: 'conservative', kyc: true, fica: true, sow: true, rpc: true, phone: '0821234572', email: 'gvrensburg@telkomsa.net', adv: advisorId },
      { first_name: 'Priya', last_name: 'Naidoo', id_number: '9205254123083', tax_number: 'TN73821007', dob: '1992-05-25', risk_profile: 'moderate', kyc: false, fica: false, sow: false, rpc: false, phone: '0631234573', email: 'priya.naidoo@gmail.com', adv: advisorId },
      { first_name: 'Heinrich', last_name: 'Swanepoel', id_number: '7512175432086', tax_number: 'TN73821008', dob: '1975-12-17', risk_profile: 'moderate_aggressive', kyc: true, fica: true, sow: true, rpc: true, phone: '0721234574', email: 'h.swanepoel@fnb.co.za', adv: advisorId },
      { first_name: 'Nomsa', last_name: 'Sithole', id_number: '8302244567081', tax_number: 'TN73821009', dob: '1983-02-24', risk_profile: 'moderate', kyc: true, fica: true, sow: false, rpc: true, phone: '0841234575', email: 'nomsa.sithole@yahoo.com', adv: advisorId },
      { first_name: 'Dirk', last_name: 'Engelbrecht', id_number: '7108135678082', tax_number: 'TN73821010', dob: '1971-08-13', risk_profile: 'aggressive', kyc: true, fica: true, sow: true, rpc: true, phone: '0821234576', email: 'dirk.engelbrecht@gmail.com', adv: advisorIds[1] || advisorId },
    ];

    const clientIds: string[] = [];
    for (const c of clientsData) {
      const r = await db.query(
        `INSERT INTO clients (advisor_id, first_name, last_name, id_number, tax_number, dob, risk_profile, tax_residency, kyc_complete, fica_complete, source_of_wealth_declared, risk_profile_complete, phone, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'sa_resident',$8,$9,$10,$11,$12,$13) RETURNING id`,
        [c.adv, c.first_name, c.last_name, c.id_number, c.tax_number, c.dob, c.risk_profile, c.kyc, c.fica, c.sow, c.rpc, c.phone, c.email],
      );
      clientIds.push(r.rows[0].id);
    }
    console.log(`✅ Created ${clientIds.length} clients`);

    // ── 7. Create Portfolios ──────────────────────────────────────────────
    const portfolioProfiles = [
      // (clientIndex, name, totalValue, fundAllocations: [{fundName, pct, value, units}])
      {
        ci: 0, name: 'Pieter du Plessis — Growth Portfolio', value: 1850000,
        funds: [
          { fn: 'Coronation Balanced Plus Fund', pct: 35, units: 1420.55 },
          { fn: 'Old Mutual Global Equity Fund', pct: 30, units: 882.32 },
          { fn: 'Sanlam Investment Core SA Equity Fund', pct: 25, units: 2105.88 },
          { fn: 'Prescient Money Market Fund', pct: 10, units: 18500.00 },
        ],
      },
      {
        ci: 0, name: 'Pieter du Plessis — Retirement Annuity', value: 2340000,
        funds: [
          { fn: 'Allan Gray Balanced Fund', pct: 45, units: 3156.75 },
          { fn: 'Ninety One Opportunity Fund', pct: 35, units: 2204.50 },
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 20, units: 4680.00 },
        ],
      },
      {
        ci: 1, name: 'Anél Coetzee — Balanced Portfolio', value: 980000,
        funds: [
          { fn: 'Coronation Balanced Plus Fund', pct: 40, units: 752.32 },
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 35, units: 3430.00 },
          { fn: 'Stanlib SA Property Fund', pct: 15, units: 4900.00 },
          { fn: 'Prescient Money Market Fund', pct: 10, units: 9800.00 },
        ],
      },
      {
        ci: 2, name: 'Johan Botha — Conservative Income Fund', value: 3200000,
        funds: [
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 45, units: 22400.00 },
          { fn: 'Brenthurst Preferred Income Fund', pct: 30, units: 19200.00 },
          { fn: 'Prescient Money Market Fund', pct: 15, units: 48000.00 },
          { fn: 'Stanlib SA Property Fund', pct: 10, units: 16000.00 },
        ],
      },
      {
        ci: 3, name: 'Thabo Nkosi — Aggressive Equity Portfolio', value: 450000,
        funds: [
          { fn: 'Sanlam Investment Core SA Equity Fund', pct: 50, units: 3750.00 },
          { fn: 'Foord Global Equity Feeder Fund', pct: 35, units: 1050.00 },
          { fn: 'Camissa Asset Management Equity Fund', pct: 15, units: 1012.50 },
        ],
      },
      {
        ci: 4, name: 'Zanele Dlamini — Moderate Balanced Fund', value: 1420000,
        funds: [
          { fn: 'Allan Gray Balanced Fund', pct: 40, units: 1702.50 },
          { fn: 'Ninety One Opportunity Fund', pct: 30, units: 1278.00 },
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 20, units: 5680.00 },
          { fn: 'Prescient Money Market Fund', pct: 10, units: 14200.00 },
        ],
      },
      {
        ci: 5, name: 'Gerrit van Rensburg — Retirement Portfolio', value: 5800000,
        funds: [
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 40, units: 46400.00 },
          { fn: 'Brenthurst Preferred Income Fund', pct: 30, units: 34800.00 },
          { fn: 'Prescient Money Market Fund', pct: 20, units: 116000.00 },
          { fn: 'Stanlib SA Property Fund', pct: 10, units: 29000.00 },
        ],
      },
      {
        ci: 5, name: 'Gerrit van Rensburg — Living Annuity', value: 2900000,
        funds: [
          { fn: 'Coronation Balanced Plus Fund', pct: 50, units: 4225.00 },
          { fn: 'Old Mutual Global Equity Fund', pct: 30, units: 2610.00 },
          { fn: 'Ninety One Opportunity Fund', pct: 20, units: 1740.00 },
        ],
      },
      {
        ci: 7, name: 'Heinrich Swanepoel — Discretionary Portfolio', value: 2150000,
        funds: [
          { fn: 'Old Mutual Global Equity Fund', pct: 40, units: 3010.00 },
          { fn: 'Sanlam Investment Core SA Equity Fund', pct: 30, units: 6450.00 },
          { fn: 'Foord Global Equity Feeder Fund', pct: 20, units: 1720.00 },
          { fn: 'Fairtree Fixed Income Prescient Fund', pct: 10, units: 4300.00 },
        ],
      },
      {
        ci: 8, name: 'Nomsa Sithole — Balanced Savings', value: 720000,
        funds: [
          { fn: 'Coronation Balanced Plus Fund', pct: 45, units: 972.00 },
          { fn: 'Ninety One Opportunity Fund', pct: 30, units: 648.00 },
          { fn: 'Prescient Money Market Fund', pct: 25, units: 18000.00 },
        ],
      },
      {
        ci: 9, name: 'Dirk Engelbrecht — Growth & Income', value: 3900000,
        funds: [
          { fn: 'Foord Global Equity Feeder Fund', pct: 35, units: 5850.00 },
          { fn: 'Camissa Asset Management Equity Fund', pct: 30, units: 11700.00 },
          { fn: 'Allan Gray Balanced Fund', pct: 20, units: 4680.00 },
          { fn: 'Brenthurst Preferred Income Fund', pct: 15, units: 11700.00 },
        ],
      },
    ];

    const portfolioIds: string[] = [];
    for (const p of portfolioProfiles) {
      const clientId = clientIds[p.ci];
      const pr = await db.query(
        `INSERT INTO portfolios (client_id, name, total_value, currency)
         VALUES ($1,$2,$3,'ZAR') RETURNING id`,
        [clientId, p.name, p.value],
      );
      const portId: string = pr.rows[0].id;
      portfolioIds.push(portId);

      for (const f of p.funds) {
        const fundId = fundIdMap[f.fn];
        if (!fundId) continue;
        const alloc = f.pct / 100;
        const val = p.value * alloc;
        await db.query(
          `INSERT INTO portfolio_funds (portfolio_id, fund_id, allocation_pct, units, value)
           VALUES ($1,$2,$3,$4,$5)`,
          [portId, fundId, alloc, f.units, val],
        );
      }
    }
    console.log(`✅ Created ${portfolioIds.length} portfolios`);

    // ── 8. Create Screening Results ───────────────────────────────────────
    // Portfolios with compromise flags get non-zero compromised_pct
    const screeningData = [
      { portIdx: 0, clean: 91.20, compromised: 8.80, passed: false, cats: [{ cat: 'alcohol', pct: 5.95 }, { cat: 'tobacco', pct: 2.85 }] },
      { portIdx: 1, clean: 88.60, compromised: 11.40, passed: false, cats: [{ cat: 'gambling', pct: 6.20 }, { cat: 'tobacco', pct: 5.20 }] },
      { portIdx: 2, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 3, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 4, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 5, clean: 96.20, compromised: 3.80, passed: false, cats: [{ cat: 'alcohol', pct: 3.80 }] },
      { portIdx: 6, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 7, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 8, clean: 93.70, compromised: 6.30, passed: false, cats: [{ cat: 'alcohol', pct: 3.80 }, { cat: 'alcohol', pct: 2.50 }] },
      { portIdx: 9, clean: 100.00, compromised: 0, passed: true, cats: [] },
      { portIdx: 10, clean: 100.00, compromised: 0, passed: true, cats: [] },
    ];

    for (const s of screeningData) {
      const portId = portfolioIds[s.portIdx];
      if (!portId) continue;
      const sr = await db.query(
        `INSERT INTO screening_results (portfolio_id, mode, clean_pct, compromised_pct, passed_strict_mode, report_json)
         VALUES ($1,'weighted',$2,$3,$4,$5) RETURNING id`,
        [portId, s.clean, s.compromised, s.passed, JSON.stringify({ screened_at: new Date().toISOString(), method: 'ai_weighted' })],
      );
      const srId: string = sr.rows[0].id;
      for (const ce of s.cats) {
        await db.query(
          `INSERT INTO category_exposures (screening_result_id, category, exposure_pct, affected_funds_count)
           VALUES ($1,$2,$3,1)`,
          [srId, ce.cat, ce.pct],
        );
      }
    }
    console.log(`✅ Created ${screeningData.length} screening results`);

    // ── 9. Create Records of Advice ───────────────────────────────────────
    const roaData = [
      { ci: 0, ai: advisorId, date: '2025-08-15', summary: 'Annual review and portfolio rebalancing. Recommended increasing global equity exposure from 25% to 30% given rand weakness forecast. Reviewed insurance needs — life cover remains adequate at R5m. Discussed estate planning goals with two minor children.', signed: '2025-08-22' },
      { ci: 0, ai: advisorId, date: '2025-02-10', summary: 'Quarterly check-in. Portfolio performing in line with benchmark. No changes recommended. Discussed increasing emergency fund to 6 months of expenses.', signed: '2025-02-14' },
      { ci: 1, ai: advisorId, date: '2025-11-01', summary: 'Initial take-on meeting. Established risk profile as Moderate. Recommended balanced portfolio split across equities, bonds and cash. Christian screening applied — excluded tobacco and gambling exposures. Documentation completed.', signed: '2025-11-05' },
      { ci: 2, ai: advisorId, date: '2025-09-20', summary: 'Pre-retirement review. Client aged 55, targeting retirement at 65. Recommended shifting from equity to income funds over next 5 years. Living annuity structure discussed for retirement phase. Tax implications of lump sum withdrawal explained.', signed: '2025-09-25' },
      { ci: 3, ai: advisorId, date: '2026-01-08', summary: 'Take-on meeting. Young professional with high risk tolerance and 30-year investment horizon. Recommended 100% equity portfolio. FICA documentation submitted — awaiting verification. KYC in progress.', signed: null },
      { ci: 4, ai: advisorId, date: '2025-07-14', summary: 'Mid-year review. Advised on tax-free savings account contribution — client not maximising R36,000 annual allowance. Recommendation to re-direct R3,000/month to TFSA. Fund screening verified — no compromise exposures.', signed: '2025-07-18' },
      { ci: 5, ai: advisorId, date: '2025-12-03', summary: 'Annual retirement income review. Living annuity drawdown rate at 2.5% — well within sustainable range. Recommended maintaining current asset allocation given 15-year life expectancy. Discussed inflation risk and healthcare cost projections.', signed: '2025-12-07' },
      { ci: 7, ai: advisorId, date: '2026-02-20', summary: 'Investment review. Discussed rand-hedging strategy through increased offshore allocation. Proposed increasing global equity from 35% to 45% by year end. Screen confirmed no compromise holdings across portfolio.', signed: '2026-02-24' },
      { ci: 8, ai: advisorId, date: '2025-10-12', summary: 'Savings plan review. Client building deposit for property purchase in 3 years. Recommended low-risk 3-year strategy. Portfolio restructured to 70% bonds / 30% money market to protect capital.', signed: '2025-10-16' },
    ];

    for (const r of roaData) {
      await db.query(
        `INSERT INTO records_of_advice (client_id, advisor_id, advice_date, advice_summary, signed_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [clientIds[r.ci], r.ai, r.date, r.summary, r.signed ? new Date(r.signed) : null],
      );
    }
    console.log(`✅ Created ${roaData.length} records of advice`);

    // ── 10. Create Financial Plans ────────────────────────────────────────
    const planData = [
      {
        ci: 0, risk: 'moderate_aggressive', score: 7.5,
        estate: 8500000, liquidity: 1200000, monthly_income: 95000, monthly_expenses: 62000,
        behaviour: { loss_aversion: 42, herding: 28, recency_bias: 35, overconfidence: 58, notes: 'Slightly overconfident, moderate loss aversion. Tends to chase performance in bull markets.' },
      },
      {
        ci: 1, risk: 'moderate', score: 5.8,
        estate: 3200000, liquidity: 480000, monthly_income: 52000, monthly_expenses: 38000,
        behaviour: { loss_aversion: 65, herding: 45, recency_bias: 52, overconfidence: 30, notes: 'High loss aversion typical of careful saver. Responsive to negative market news.' },
      },
      {
        ci: 2, risk: 'conservative', score: 3.2,
        estate: 12000000, liquidity: 3500000, monthly_income: 45000, monthly_expenses: 38000,
        behaviour: { loss_aversion: 88, herding: 22, recency_bias: 40, overconfidence: 15, notes: 'Very high loss aversion. Risk averse retiree. Prioritises capital preservation above all.' },
      },
      {
        ci: 4, risk: 'moderate_conservative', score: 4.5,
        estate: 1800000, liquidity: 350000, monthly_income: 68000, monthly_expenses: 51000,
        behaviour: { loss_aversion: 72, herding: 38, recency_bias: 44, overconfidence: 25, notes: 'Moderately risk averse. Dislikes volatility. Comfortable with 3-5 year investment horizon.' },
      },
      {
        ci: 5, risk: 'conservative', score: 2.8,
        estate: 22000000, liquidity: 6000000, monthly_income: 35000, monthly_expenses: 28000,
        behaviour: { loss_aversion: 92, herding: 18, recency_bias: 36, overconfidence: 12, notes: 'Retired. Maximum capital preservation. Sequence of returns risk is primary concern.' },
      },
      {
        ci: 7, risk: 'moderate_aggressive', score: 7.2,
        estate: 6800000, liquidity: 960000, monthly_income: 118000, monthly_expenses: 74000,
        behaviour: { loss_aversion: 38, herding: 35, recency_bias: 48, overconfidence: 62, notes: 'Comfortable with high volatility. Long investment horizon. Some recency bias noted.' },
      },
    ];

    for (const p of planData) {
      const clientAdvisorId = clientsData[p.ci].adv;
      await db.query(
        `INSERT INTO financial_plans (client_id, advisor_id, risk_profile, risk_score, behaviour_profile, estate_value, liquidity_needs, monthly_income, monthly_expenses)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [clientIds[p.ci], clientAdvisorId, p.risk, p.score, JSON.stringify(p.behaviour), p.estate, p.liquidity, p.monthly_income, p.monthly_expenses],
      );
    }
    console.log(`✅ Created ${planData.length} financial plans`);

    await db.query('COMMIT');
    console.log('\n🎉 Seed complete! Summary:');
    console.log(`   • Funds:              ${fundsData.length}`);
    console.log(`   • Holdings:           ${holdingCount}`);
    console.log(`   • Compromise flags:   ${flagCount}`);
    console.log(`   • Clients:            ${clientIds.length}`);
    console.log(`   • Portfolios:         ${portfolioIds.length}`);
    console.log(`   • Screening results:  ${screeningData.length}`);
    console.log(`   • Records of advice:  ${roaData.length}`);
    console.log(`   • Financial plans:    ${planData.length}`);

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Seed failed — rolled back:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
