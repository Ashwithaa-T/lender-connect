import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, TrendingUp, Shield, IndianRupee } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface AssessmentData {
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

const Insights = () => {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("lastAssessment");
    if (storedData) {
      setAssessment(JSON.parse(storedData));
    }
  }, []);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="text-center py-20">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Recent Assessment</h2>
            <p className="text-muted-foreground mb-6">
              Submit a loan application to view applicant insights
            </p>
            <Button onClick={() => navigate("/apply")}>
              Start New Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { insights, applicant, metrics, decision } = assessment;

  const radarData = [
    { subject: "CIBIL Strength", A: insights.cibilStrength, fullMark: 100 },
    { subject: "Revenue Strength", A: insights.revenueStrength, fullMark: 100 },
    { subject: "Loan Capacity", A: insights.loanCapacity, fullMark: 100 },
    { subject: "Risk Score", A: insights.riskScore, fullMark: 100 },
  ];

  const emiData = [
    { name: "EMI", value: metrics.emi, fill: "hsl(var(--accent))" },
    { name: "Remaining Income", value: applicant.monthlyRevenue - metrics.emi, fill: "hsl(var(--secondary))" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Gauge chart component
  const GaugeChart = ({ value, label }: { value: number; label: string }) => {
    const rotation = (value / 100) * 180 - 90;
    const color = value >= 70 ? "hsl(var(--secondary))" : value >= 40 ? "hsl(45, 100%, 50%)" : "hsl(var(--destructive))";
    
    return (
      <div className="relative w-full h-32">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.2} 251.2`}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="40"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation}, 100, 100)`}
          />
          <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold" fill="currentColor">
            {value}%
          </text>
        </svg>
        <p className="text-center text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Applicant Insights</h1>
          <p className="text-muted-foreground">
            Detailed analysis for {applicant.name}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p className="font-semibold">{applicant.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CIBIL Score</p>
                  <p className="font-semibold">{applicant.cibilScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Requested</p>
                  <p className="font-semibold">{formatCurrency(applicant.loanAmountRequested)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  decision.riskCategory === "Low" ? "bg-secondary/20" : 
                  decision.riskCategory === "Medium" ? "bg-yellow-500/20" : "bg-destructive/20"
                }`}>
                  <Shield className={`w-5 h-5 ${
                    decision.riskCategory === "Low" ? "text-secondary" : 
                    decision.riskCategory === "Medium" ? "text-yellow-500" : "text-destructive"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Category</p>
                  <p className="font-semibold">{decision.riskCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="text-lg">Profile Strength Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="Strength"
                    dataKey="A"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gauge Chart */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="text-lg">Approval Probability</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-full max-w-xs">
                <GaugeChart value={decision.approvalProbability} label="Likelihood of Approval" />
                <div className="text-center mt-4">
                  <p className={`text-lg font-semibold ${
                    decision.approved ? "text-secondary" : "text-destructive"
                  }`}>
                    {decision.approved ? "Eligible for Loan" : "Not Eligible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EMI Burden Chart */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="text-lg">EMI Burden vs Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={emiData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {emiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(applicant.monthlyRevenue)}</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10">
                  <p className="text-sm text-muted-foreground">EMI Amount</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(metrics.emi)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <p className="text-sm text-muted-foreground">EMI Burden</p>
                  <p className="text-2xl font-bold text-secondary">{metrics.emiToIncomeRatio}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parseFloat(metrics.emiToIncomeRatio) <= 40 ? "Healthy burden level" : "High burden level"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
