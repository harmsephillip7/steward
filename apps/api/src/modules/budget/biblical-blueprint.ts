/** 
 * Steward Biblical Budget Blueprint
 * Spending targets expressed as a percentage of net monthly income.
 * Grounded in the principle of faithful stewardship — generous giving,
 * disciplined saving, and living within means.
 */

export interface BlueprintEntry {
  label: string;
  target_pct: number;
  description: string;
}

export const BIBLICAL_BLUEPRINT: Record<string, BlueprintEntry> = {
  giving: {
    label: 'Giving',
    target_pct: 10,
    description: 'Tithes, charitable giving, and generosity',
  },
  saving: {
    label: 'Saving & Investing',
    target_pct: 15,
    description: 'Emergency fund, retirement, and wealth building',
  },
  housing: {
    label: 'Housing',
    target_pct: 25,
    description: 'Rent/bond, rates, electricity, and maintenance',
  },
  food: {
    label: 'Food & Groceries',
    target_pct: 12,
    description: 'Groceries, household supplies',
  },
  transport: {
    label: 'Transport',
    target_pct: 12,
    description: 'Vehicle payments, fuel, public transport',
  },
  medical: {
    label: 'Medical & Health',
    target_pct: 5,
    description: 'Medical aid, medication, and healthcare',
  },
  insurance: {
    label: 'Insurance',
    target_pct: 5,
    description: 'Life, disability, vehicle, and home insurance',
  },
  clothing: {
    label: 'Clothing',
    target_pct: 4,
    description: 'Clothing and footwear for the family',
  },
  entertainment: {
    label: 'Entertainment & Dining',
    target_pct: 5,
    description: 'Restaurants, streaming, recreation',
  },
  personal: {
    label: 'Personal Care',
    target_pct: 5,
    description: 'Haircuts, toiletries, personal expenses',
  },
  debt: {
    label: 'Debt Repayment',
    target_pct: 2,
    description: 'Credit cards, personal loans (target: zero debt)',
  },
};

export const CATEGORY_KEYS = Object.keys(BIBLICAL_BLUEPRINT);

/** 
 * OpenAI prompt: categorise transactions into one of the known keys.
 * The model returns a JSON array — one category per transaction.
 */
export const TRANSACTION_CATEGORISATION_SYSTEM = `
You are a financial data assistant. Given a list of bank statement transactions, 
classify each one into exactly one of these categories:
giving, saving, housing, food, transport, medical, insurance, clothing, entertainment, personal, debt, income, other.

Rules:
- "income" = salary deposits, freelance payments, interest received, dividends
- "saving" = transfers to savings/investment accounts, unit trust purchases
- "giving" = donations, church contributions, charitable transfers
- "housing" = rent, bond, rates, levies, electricity, water, home maintenance
- "food" = supermarkets, groceries, Pick n Pay, Woolworths Food, Checkers, Spar
- "transport" = fuel, Uber, Bolt, vehicle instalments, eNatis, tolls, parking
- "medical" = medical aid, pharmacy, doctor, hospital
- "insurance" = insurance premiums (life, car, home, disability)
- "clothing" = clothing stores, shoe shops
- "entertainment" = restaurants, coffee shops, takeaways, Netflix, sport, events
- "personal" = haircuts, beauty, toiletries, gym
- "debt" = credit card payments, personal loan instalments
- "other" = anything that doesn't fit above categories

Respond with ONLY a JSON array of strings (one per transaction, same order as input).
Example: ["income","housing","food","transport","other"]
`.trim();

export const ANALYSIS_SYSTEM_PROMPT = `
You are Steward, a Christian-values financial wellness coach. 
Analyse a client's monthly spending averages compared to a healthy budget blueprint 
and produce a wellness report.

Respond with ONLY valid JSON in this exact shape:
{
  "score": <integer 0-100>,
  "score_label": <"Excellent"|"Good"|"Fair"|"Needs Work">,
  "strengths": [<up to 3 short positive observations, max 15 words each>],
  "overspending_areas": [<up to 4 short warnings about over-budget categories, max 15 words each>],
  "ai_advice": <2-3 paragraph plain-text advice. Warm, encouraging, practical. 
                No scripture citations. Focus on stewardship, intentional living, 
                generosity, and getting out of debt. 150-220 words.>
}

Scoring guide:
- 80-100: Giving + saving targets met; ≤2 categories over budget → Excellent
- 60-79: Saving target met OR giving met; ≤3 categories over → Good  
- 40-59: One or both not met; several overspend areas → Fair
- 0-39: Significant overspending in multiple areas; no saving → Needs Work
`.trim();
