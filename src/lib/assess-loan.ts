import model from "./model.json";

// Calculate EMI using standard formula
function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

function sigmoid(z: number): number { return 1 / (1 + Math.exp(-z)); }

function buildFeatureVector(applicant: Record<string, unknown>): number[] {
  const vec: number[] = [];
  model.numeric_features.forEach((name: string, i: number) => {
    const raw = applicant[name];
    const v = (raw === null || raw === undefined || Number.isNaN(Number(raw)))
      ? model.numeric.medians[i]
      : Number(raw);
    vec.push((v - model.numeric.means[i]) / model.numeric.scales[i]);
  });
  model.categorical_features.forEach((name: string, i: number) => {
    const cats: string[] = model.categorical.categories[i];
    const raw = (applicant[name] ?? model.categorical.modes[i]) as string;
    cats.forEach((c: string) => vec.push(c === raw ? 1 : 0));
  });
  return vec;
}

function predictApproval(applicant: Record<string, unknown>) {
  const x = buildFeatureVector(applicant);
  const { coef, intercept } = model.logreg;
  let z = intercept;
  for (let i = 0; i < coef.length; i++) z += coef[i] * x[i];
  const probability = sigmoid(z);
  const approved = probability >= model.thresholds.approve;
  let risk_level: "Low" | "Medium" | "High" = "High";
  if (probability >= model.thresholds.risk_low) risk_level = "Low";
  else if (probability >= model.thresholds.risk_medium) risk_level = "Medium";
  return { probability, approved, risk_level };
}

function mapFormToModelInput(p: {
  age: number; monthlyRevenue: number; annualRevenue: number;
  existingLoans: number; loanAmountRequested: number; cibilScore: number;
  loanTenureMonths: number; businessType: string;
}, interestRate: number, emi: number) {
  return {
    age: p.age,
    annual_income: p.annualRevenue,
    monthly_income: p.monthlyRevenue,
    debt_to_income_ratio: p.monthlyRevenue > 0 ? Math.min(1, p.existingLoans / (p.annualRevenue || 1)) : 0,
    credit_score: p.cibilScore,
    loan_amount: p.loanAmountRequested,
    interest_rate: interestRate,
    loan_term: p.loanTenureMonths,
    installment: emi,
    current_balance: p.existingLoans,
    employment_status: "Self-employed",
    loan_purpose: "Business",
  } as Record<string, unknown>;
}

function calculateRecommendedLoan(
  monthlyRevenue: number,
  existingLoans: number,
  cibilScore: number
): number {
  let maxMultiplier = 6;
  if (cibilScore >= 750) maxMultiplier = 8;
  else if (cibilScore >= 700) maxMultiplier = 6;
  else if (cibilScore >= 650) maxMultiplier = 4;
  else maxMultiplier = 3;
  
  const maxLoan = (monthlyRevenue * maxMultiplier) - existingLoans;
  return Math.max(0, Math.round(maxLoan / 10000) * 10000);
}

export function assessLoanApplication(params: {
  applicantName: string;
  age: number;
  businessType: string;
  monthlyRevenue: number; 
  annualRevenue: number;
  existingLoans: number; 
  loanAmountRequested: number; 
  cibilScore: number;
  loanTenureMonths: number;
  businessAgeMonths: number;
}) {
  const { 
    applicantName, age, businessType, monthlyRevenue, annualRevenue,
    existingLoans, loanAmountRequested, cibilScore, loanTenureMonths, businessAgeMonths 
  } = params;

  let interestRate = 18;
  if (cibilScore >= 750) interestRate = 12;
  else if (cibilScore >= 700) interestRate = 14;
  else if (cibilScore >= 650) interestRate = 16;
  else if (cibilScore >= 550) interestRate = 18;
  else interestRate = 22;

  const loanToRevenueRatio = loanAmountRequested / monthlyRevenue;
  const emi = calculateEMI(loanAmountRequested, interestRate, loanTenureMonths);
  const emiToIncomeRatio = (emi / monthlyRevenue) * 100;

  const modelInput = mapFormToModelInput(
    { age, monthlyRevenue, annualRevenue, existingLoans, loanAmountRequested,
      cibilScore, loanTenureMonths, businessType },
    interestRate, emi,
  );
  
  const ml = predictApproval(modelInput);
  const approved = ml.approved;
  const approvalProbability = Math.round(ml.probability * 100);
  const riskCategory = ml.risk_level;
  const riskScore = Math.round((1 - ml.probability) * 100);

  const reasons: string[] = [];
  if (cibilScore < 600) reasons.push("Low credit score increases default risk");
  else if (cibilScore >= 750) reasons.push("Strong credit score");
  if (loanToRevenueRatio > 6) reasons.push("Loan amount is large vs monthly revenue");
  if (emiToIncomeRatio > 50) reasons.push("EMI burden exceeds 50% of monthly income");
  if (businessAgeMonths < 12) reasons.push("Business has limited operational history");
  if (existingLoans > annualRevenue * 0.5) reasons.push("High existing debt relative to income");
  if (reasons.length === 0) {
    reasons.push(approved ? "ML model: applicant profile matches approved patterns"
                          : "ML model: applicant profile matches rejected patterns");
  }

  const recommendedLoanAmount = calculateRecommendedLoan(monthlyRevenue, existingLoans, cibilScore);
  const revenueStrength = Math.min(100, (annualRevenue / loanAmountRequested) * 10);
  const loanCapacity = Math.min(100, (recommendedLoanAmount / loanAmountRequested) * 100);
  const cibilStrength = ((cibilScore - 300) / 600) * 100;

  return { 
    decision: {
      approved,
      reasons,
      riskCategory,
      riskScore,
      approvalProbability,
      model: "LogisticRegression",
    },
    metrics: {
      loanToRevenueRatio: loanToRevenueRatio.toFixed(2),
      emi,
      emiToIncomeRatio: emiToIncomeRatio.toFixed(2),
      interestRate,
      recommendedLoanAmount,
      totalRepayment: emi * loanTenureMonths
    },
    insights: {
      cibilStrength: Math.round(cibilStrength),
      revenueStrength: Math.round(revenueStrength),
      loanCapacity: Math.round(loanCapacity),
      riskScore: approvalProbability
    },
    applicant: {
      name: applicantName,
      age,
      businessType,
      monthlyRevenue,
      annualRevenue,
      cibilScore,
      loanAmountRequested,
      loanTenureMonths,
      businessAgeMonths
    }
  };
}
