import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, TrendingUp, IndianRupee, Percent, Calendar, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEffect } from "react";

interface AssessmentResult {
  decision: {
    approved: boolean;
    reasons: string[];
    riskCategory: string;
    riskScore: number;
    approvalProbability: number;
  };
  metrics: {
    loanToRevenueRatio: string;
    emi: number;
    emiToIncomeRatio: string;
    interestRate: number;
    recommendedLoanAmount: number;
    totalRepayment: number;
  };
  insights: {
    cibilStrength: number;
    revenueStrength: number;
    loanCapacity: number;
    riskScore: number;
  };
  applicant: {
    name: string;
    age: number;
    businessType: string;
    monthlyRevenue: number;
    annualRevenue: number;
    cibilScore: number;
    loanAmountRequested: number;
    loanTenureMonths: number;
    businessAgeMonths: number;
  };
}

interface LocationState {
  assessmentResult: AssessmentResult;
  formData: any;
}

const AssessmentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.assessmentResult) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.assessmentResult) {
    return null;
  }

  const { decision, metrics, applicant } = state.assessmentResult;

  const getRiskColor = (category: string) => {
    switch (category) {
      case "Low": return "bg-secondary text-secondary-foreground";
      case "Medium": return "bg-yellow-500 text-white";
      case "High": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" />
            New Assessment
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/insights")}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Insights
          </Button>
        </div>

        {/* Decision Card */}
        <Card className={`mb-8 overflow-hidden animate-scale-in ${
          decision.approved 
            ? "border-secondary/50 bg-gradient-to-br from-secondary/10 to-transparent" 
            : "border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent"
        }`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {decision.approved ? (
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center animate-fade-in">
                    <CheckCircle2 className="w-12 h-12 text-secondary" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center animate-fade-in">
                    <XCircle className="w-12 h-12 text-destructive" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {decision.approved ? "Loan Approved" : "Loan Not Approved"}
                  </h1>
                  <p className="text-muted-foreground">
                    Application for {applicant.name} • {applicant.businessType}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={getRiskColor(decision.riskCategory)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {decision.riskCategory} Risk
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {decision.approvalProbability}% Approval Score
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">EMI Amount</span>
                <IndianRupee className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(metrics.emi)}</p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Interest Rate</span>
                <Percent className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold">{metrics.interestRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">per annum</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Loan-to-Revenue</span>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold">{metrics.loanToRevenueRatio}x</p>
              <p className="text-xs text-muted-foreground mt-1">monthly revenue</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Repayment</span>
                <Calendar className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalRepayment)}</p>
              <p className="text-xs text-muted-foreground mt-1">over {applicant.loanTenureMonths} months</p>
            </CardContent>
          </Card>
        </div>

        {/* Reasons & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Decision Reasons */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-accent" />
                {decision.approved ? "Assessment Summary" : "Reasons for Decision"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {decision.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                    <span className={`w-2 h-2 rounded-full mt-2 ${
                      decision.approved ? "bg-secondary" : "bg-destructive"
                    }`} />
                    <span className="text-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IndianRupee className="w-5 h-5 text-accent" />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Recommended Loan Amount</p>
                <p className="text-3xl font-bold text-accent">{formatCurrency(metrics.recommendedLoanAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">EMI Burden</p>
                  <p className="text-lg font-semibold">{metrics.emiToIncomeRatio}%</p>
                  <p className="text-xs text-muted-foreground">of monthly income</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CIBIL Score</p>
                  <p className="text-lg font-semibold">{applicant.cibilScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {applicant.cibilScore >= 750 ? "Excellent" : applicant.cibilScore >= 700 ? "Good" : applicant.cibilScore >= 650 ? "Fair" : "Poor"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Applicant</p>
                <p className="font-medium">{applicant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{applicant.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="font-medium">{applicant.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Age</p>
                <p className="font-medium">{applicant.businessAgeMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="font-medium">{formatCurrency(applicant.monthlyRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Revenue</p>
                <p className="font-medium">{formatCurrency(applicant.annualRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested Amount</p>
                <p className="font-medium">{formatCurrency(applicant.loanAmountRequested)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenure</p>
                <p className="font-medium">{applicant.loanTenureMonths} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentResults;
