"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SA_TAX = exports.DEFAULT_ASSET_ALLOCATION = exports.RISK_PROFILE_LABELS = exports.COMPROMISE_CATEGORIES = exports.BehaviourBias = exports.TaxResidency = exports.IngestionStatus = exports.Region = exports.AssetClass = exports.ComplianceStatus = exports.FlagSource = exports.CompromiseCategory = exports.ScreeningMode = exports.RiskProfile = void 0;
var RiskProfile;
(function (RiskProfile) {
    RiskProfile["CONSERVATIVE"] = "conservative";
    RiskProfile["MODERATE_CONSERVATIVE"] = "moderate_conservative";
    RiskProfile["MODERATE"] = "moderate";
    RiskProfile["MODERATE_AGGRESSIVE"] = "moderate_aggressive";
    RiskProfile["AGGRESSIVE"] = "aggressive";
})(RiskProfile || (exports.RiskProfile = RiskProfile = {}));
var ScreeningMode;
(function (ScreeningMode) {
    ScreeningMode["STRICT"] = "strict";
    ScreeningMode["WEIGHTED"] = "weighted";
})(ScreeningMode || (exports.ScreeningMode = ScreeningMode = {}));
var CompromiseCategory;
(function (CompromiseCategory) {
    CompromiseCategory["ALCOHOL"] = "alcohol";
    CompromiseCategory["TOBACCO"] = "tobacco";
    CompromiseCategory["GAMBLING"] = "gambling";
    CompromiseCategory["ABORTION"] = "abortion";
    CompromiseCategory["WEAPONS"] = "weapons";
    CompromiseCategory["PORNOGRAPHY"] = "pornography";
    CompromiseCategory["CANNABIS"] = "cannabis";
})(CompromiseCategory || (exports.CompromiseCategory = CompromiseCategory = {}));
var FlagSource;
(function (FlagSource) {
    FlagSource["MANUAL"] = "manual";
    FlagSource["AI"] = "ai";
})(FlagSource || (exports.FlagSource = FlagSource = {}));
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["COMPLETE"] = "complete";
    ComplianceStatus["INCOMPLETE"] = "incomplete";
    ComplianceStatus["PENDING"] = "pending";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
var AssetClass;
(function (AssetClass) {
    AssetClass["EQUITY"] = "equity";
    AssetClass["BOND"] = "bond";
    AssetClass["PROPERTY"] = "property";
    AssetClass["CASH"] = "cash";
    AssetClass["MULTI_ASSET"] = "multi_asset";
    AssetClass["COMMODITY"] = "commodity";
    AssetClass["ALTERNATIVE"] = "alternative";
})(AssetClass || (exports.AssetClass = AssetClass = {}));
var Region;
(function (Region) {
    Region["SA"] = "SA";
    Region["GLOBAL"] = "global";
    Region["AFRICA"] = "africa";
    Region["US"] = "us";
    Region["EUROPE"] = "europe";
    Region["ASIA"] = "asia";
})(Region || (exports.Region = Region = {}));
var IngestionStatus;
(function (IngestionStatus) {
    IngestionStatus["PENDING"] = "pending";
    IngestionStatus["PROCESSING"] = "processing";
    IngestionStatus["COMPLETE"] = "complete";
    IngestionStatus["FAILED"] = "failed";
})(IngestionStatus || (exports.IngestionStatus = IngestionStatus = {}));
var TaxResidency;
(function (TaxResidency) {
    TaxResidency["SA_RESIDENT"] = "sa_resident";
    TaxResidency["NON_RESIDENT"] = "non_resident";
})(TaxResidency || (exports.TaxResidency = TaxResidency = {}));
var BehaviourBias;
(function (BehaviourBias) {
    BehaviourBias["LOSS_AVERSION"] = "loss_aversion";
    BehaviourBias["HERDING"] = "herding";
    BehaviourBias["RECENCY_BIAS"] = "recency_bias";
    BehaviourBias["OVERCONFIDENCE"] = "overconfidence";
})(BehaviourBias || (exports.BehaviourBias = BehaviourBias = {}));
exports.COMPROMISE_CATEGORIES = Object.values(CompromiseCategory);
exports.RISK_PROFILE_LABELS = {
    [RiskProfile.CONSERVATIVE]: 'Conservative',
    [RiskProfile.MODERATE_CONSERVATIVE]: 'Moderate Conservative',
    [RiskProfile.MODERATE]: 'Moderate',
    [RiskProfile.MODERATE_AGGRESSIVE]: 'Moderate Aggressive',
    [RiskProfile.AGGRESSIVE]: 'Aggressive',
};
exports.DEFAULT_ASSET_ALLOCATION = {
    [RiskProfile.CONSERVATIVE]: { equity_pct: 20, bond_pct: 50, cash_pct: 20, property_pct: 10 },
    [RiskProfile.MODERATE_CONSERVATIVE]: { equity_pct: 35, bond_pct: 40, cash_pct: 15, property_pct: 10 },
    [RiskProfile.MODERATE]: { equity_pct: 55, bond_pct: 25, cash_pct: 10, property_pct: 10 },
    [RiskProfile.MODERATE_AGGRESSIVE]: { equity_pct: 70, bond_pct: 15, cash_pct: 5, property_pct: 10 },
    [RiskProfile.AGGRESSIVE]: { equity_pct: 85, bond_pct: 5, cash_pct: 5, property_pct: 5 },
};
exports.SA_TAX = {
    CGT_ANNUAL_EXCLUSION_INDIVIDUAL: 40_000,
    CGT_INCLUSION_RATE_INDIVIDUAL: 0.4,
    ESTATE_DUTY_RATE_STANDARD: 0.2,
    ESTATE_DUTY_RATE_EXCESS: 0.25,
    ESTATE_DUTY_EXCESS_THRESHOLD: 30_000_000,
    ESTATE_ABATEMENT: 3_500_000,
    DIVIDEND_WITHHOLDING_TAX: 0.2,
    EXECUTOR_FEES_RATE: 0.035,
};
//# sourceMappingURL=index.js.map