import { Injectable } from '@nestjs/common';
import {
  retirementGap,
  RetirementInput,
  lifeCoverNeed,
  LifeCoverInput,
  disabilityNeed,
  DisabilityInput,
  dreadDiseaseNeed,
  DreadDiseaseInput,
  estateLiquidity,
  EstateInput,
  educationGoal,
  EducationGoalInput,
  tfsaRoomCheck,
  TfsaCheckInput,
  reg28Check,
  AssetExposure,
  livingAnnuityProjection,
  LivingAnnuityInput,
  calcIncomeTax,
} from './calculators';

export interface FnaCalculateInput {
  retirement?: RetirementInput;
  life?: LifeCoverInput;
  disability?: DisabilityInput;
  dread_disease?: DreadDiseaseInput;
  estate?: EstateInput;
  education?: EducationGoalInput[];
  tfsa?: TfsaCheckInput;
  reg28?: AssetExposure[];
  living_annuity?: LivingAnnuityInput;
  income_tax?: { taxable_income: number; age?: number };
}

@Injectable()
export class FnaCalculatorService {
  calculate(input: FnaCalculateInput) {
    return {
      retirement_gap: input.retirement ? retirementGap(input.retirement) : null,
      life_cover: input.life ? lifeCoverNeed(input.life) : null,
      disability: input.disability ? disabilityNeed(input.disability) : null,
      dread_disease: input.dread_disease ? dreadDiseaseNeed(input.dread_disease) : null,
      estate: input.estate ? estateLiquidity(input.estate) : null,
      education: input.education ? input.education.map((e) => educationGoal(e)) : null,
      tfsa: input.tfsa ? tfsaRoomCheck(input.tfsa) : null,
      reg28: input.reg28 ? reg28Check(input.reg28) : null,
      living_annuity: input.living_annuity
        ? livingAnnuityProjection(input.living_annuity)
        : null,
      income_tax: input.income_tax
        ? {
            taxable_income: input.income_tax.taxable_income,
            tax_payable: calcIncomeTax(input.income_tax.taxable_income, input.income_tax.age ?? 30),
          }
        : null,
    };
  }
}
