import { Injectable } from '@nestjs/common';
import { BehaviourProfile } from '@steward/shared';

// Each question maps to a bias dimension: [lossAversion, herding, recencyBias, overconfidence]
const BIAS_QUESTION_MAP: Record<number, keyof BehaviourProfile> = {
  1: 'loss_aversion',
  2: 'loss_aversion',
  3: 'herding',
  4: 'herding',
  5: 'recency_bias',
  6: 'recency_bias',
  7: 'overconfidence',
  8: 'overconfidence',
};

export const BEHAVIOUR_QUESTIONS = [
  { id: 1, question: 'I check my portfolio value more than once per day during market downturns.' },
  { id: 2, question: 'I find it more painful to lose R10,000 than satisfying to gain R10,000.' },
  { id: 3, question: 'I tend to invest in the same funds as colleagues or family members.' },
  { id: 4, question: 'When markets rise, I increase my exposure; when they fall, I reduce it.' },
  { id: 5, question: 'I believe recent strong performers will continue to outperform.' },
  { id: 6, question: "I update my investment strategy based on the past year's market performance." },
  { id: 7, question: 'I believe I can pick investments that will outperform the market.' },
  { id: 8, question: 'I have made investment decisions that turned out better than I expected — regularly.' },
];

const BIAS_NOTES: Record<string, string> = {
  loss_aversion: 'Client shows signs of loss aversion. Consider emphasising capital protection features and avoid showing short-term portfolio fluctuations prominently.',
  herding: 'Client may be influenced by popular opinion. Ensure recommendations are based on client-specific needs rather than market trends.',
  recency_bias: 'Client may overweight recent performance. Provide long-term historical context when presenting fund performance.',
  overconfidence: "Client may overestimate their market knowledge. Frame recommendations in terms of risk management and structured planning.",
};

@Injectable()
export class BehaviourService {
  getQuestions() {
    return BEHAVIOUR_QUESTIONS;
  }

  assessBehaviourBias(answers: { question_id: number; answer_value: number }[]): BehaviourProfile {
    const scores: Record<string, number[]> = {
      loss_aversion: [],
      herding: [],
      recency_bias: [],
      overconfidence: [],
    };

    for (const answer of answers) {
      const bias = BIAS_QUESTION_MAP[answer.question_id];
      if (bias && bias !== 'notes') {
        scores[bias].push(answer.answer_value);
      }
    }

    const avg = (arr: number[]) =>
      arr.length === 0 ? 50 : (arr.reduce((s, v) => s + v, 0) / arr.length) * 20;

    const loss_aversion = avg(scores.loss_aversion);
    const herding = avg(scores.herding);
    const recency_bias = avg(scores.recency_bias);
    const overconfidence = avg(scores.overconfidence);

    const notesList: string[] = [];
    if (loss_aversion > 60) notesList.push(BIAS_NOTES.loss_aversion);
    if (herding > 60) notesList.push(BIAS_NOTES.herding);
    if (recency_bias > 60) notesList.push(BIAS_NOTES.recency_bias);
    if (overconfidence > 60) notesList.push(BIAS_NOTES.overconfidence);

    return {
      loss_aversion,
      herding,
      recency_bias,
      overconfidence,
      notes: notesList.join('\n\n') || 'No significant behavioural biases detected.',
    };
  }
}
