import { Injectable } from '@nestjs/common';
import {
  compareReplacement,
  ReplacementCompareInput,
  ReplacementCompareOutput,
} from './replacement-comparison.service';

/** Nest-injectable wrapper around the pure-function compareReplacement(). */
@Injectable()
export class ReplacementComparisonService {
  compare(input: ReplacementCompareInput): ReplacementCompareOutput {
    return compareReplacement(input);
  }
}
