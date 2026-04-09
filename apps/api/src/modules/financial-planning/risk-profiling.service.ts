import { Injectable } from '@nestjs/common';
import {
  RiskProfile,
  RiskAnswer,
  DEFAULT_ASSET_ALLOCATION,
} from '@steward/shared';

// 10 standardised questions: answer 1 (conservative) to 5 (aggressive)
const RISK_SCORE_THRESHOLDS = [
  { max: 15, profile: RiskProfile.CONSERVATIVE },
  { max: 22, profile: RiskProfile.MODERATE_CONSERVATIVE },
  { max: 30, profile: RiskProfile.MODERATE },
  { max: 38, profile: RiskProfile.MODERATE_AGGRESSIVE },
  { max: 50, profile: RiskProfile.AGGRESSIVE },
];

export const RISK_QUESTIONS = [
  { id: 1, question: 'What is your primary investment goal?', options: ['Capital preservation', 'Income', 'Balanced growth and income', 'Capital growth', 'Maximum capital growth'] },
  { id: 2, question: 'How long is your investment horizon?', options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', 'More than 10 years'] },
  { id: 3, question: 'How would you react if your portfolio dropped 20% in one month?', options: ['Sell everything immediately', 'Move to more conservative investments', 'Hold and wait', 'Hold and possibly add more', 'Buy more aggressively'] },
  { id: 4, question: 'What level of annual return variation are you comfortable with?', options: ['Less than 5%', '5–10%', '10–15%', '15–25%', 'More than 25%'] },
  { id: 5, question: 'What is your primary source of income?', options: ['Fixed salary / pension', 'Salary with some bonuses', 'Self-employed / variable income', 'Investment income', 'Multiple income streams'] },
  { id: 6, question: 'Do you have an emergency fund covering 6+ months of expenses?', options: ['No emergency fund', 'Less than 3 months', '3–6 months', '6–12 months', 'More than 12 months'] },
  { id: 7, question: 'How much investment experience do you have?', options: ['None', 'Basic', 'Some experience with unit trusts', 'Experienced with shares and funds', 'Professional / advanced'] },
  { id: 8, question: 'What percentage of your total wealth is this investment?', options: ['More than 80%', '60–80%', '40–60%', '20–40%', 'Less than 20%'] },
  { id: 9, question: 'How do you feel about taking calculated investment risks?', options: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'] },
  { id: 10, question: 'Which portfolio scenario would you prefer over 5 years?', options: ['Low risk: worst -5%, best +5%', 'Low-med: worst -10%, best +10%', 'Medium: worst -15%, best +20%', 'Med-high: worst -25%, best +35%', 'High: worst -40%, best +60%'] },
];

@Injectable()
export class RiskProfilingService {
  getQuestions() {
    return RISK_QUESTIONS;
  }

  scoreRiskProfile(answers: RiskAnswer[]): {
    score: number;
    profile: RiskProfile;
    allocation: typeof DEFAULT_ASSET_ALLOCATION[RiskProfile];
  } {
    const score = answers.reduce((sum, a) => sum + a.answer_value, 0);

    const threshold = RISK_SCORE_THRESHOLDS.find((t) => score <= t.max);
    const profile = threshold?.profile ?? RiskProfile.AGGRESSIVE;
    const allocation = DEFAULT_ASSET_ALLOCATION[profile];

    return { score, profile, allocation };
  }
}
