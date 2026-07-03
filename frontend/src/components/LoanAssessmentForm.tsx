import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { assessLoanApplication } from "@/lib/assess-loan";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Building2, IndianRupee, CreditCard, Calendar, Briefcase, Server, Wifi, WifiOff } from "lucide-react";

const API_BASE = "http://localhost:8000";

const businessTypes = [
  "Retail",
  "Manufacturing",
  "Services",
  "Food & Beverage",
  "Healthcare",
  "Technology",
  "Construction",
  "Agriculture",
  "Transportation",
  "Education",
  "Other"
];

export const LoanAssessmentForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  const [formData, setFormData] = useState({
    applicantName: "",
    age: "",
    businessType: "",
    monthlyRevenue: "",
    annualRevenue: "",
    existingLoans: "0",
    loanAmountRequested: "",
    cibilScore: "",
    loanTenureMonths: "",
    businessAgeMonths: "",
  });

  // ── Check if the FastAPI backend is reachable ──────────────────
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
        setApiStatus(res.ok ? "online" : "offline");
      } catch {
        setApiStatus("offline");
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const age = parseInt(formData.age);
      const cibilScore = parseInt(formData.cibilScore);
      const monthlyRevenue = parseFloat(formData.monthlyRevenue);
      const annualRevenue = parseFloat(formData.annualRevenue);
      const existingLoans = parseFloat(formData.existingLoans) || 0;
      const loanAmountRequested = parseFloat(formData.loanAmountRequested);
      const loanTenureMonths = parseInt(formData.loanTenureMonths);
      const businessAgeMonths = parseInt(formData.businessAgeMonths);

      // Validations
      if (age < 18 || age > 80) {
        toast({ title: "Invalid Age", description: "Age must be between 18 and 80 years", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (cibilScore < 300 || cibilScore > 900) {
        toast({ title: "Invalid CIBIL Score", description: "CIBIL score must be between 300 and 900", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!formData.businessType) {
        toast({ title: "Business Type Required", description: "Please select a business type", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // ── Try FastAPI backend first ──────────────────────────────
      let data = null;
      let usedApi = false;

      if (apiStatus === "online") {
        try {
          const apiRes = await fetch(`${API_BASE}/api/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicant_name: formData.applicantName,
              age,
              credit_score: cibilScore,
              annual_income: annualRevenue,
              monthly_income: monthlyRevenue,
              loan_amount: loanAmountRequested,
              loan_term: loanTenureMonths,
              existing_debt: existingLoans,
              business_age_months: businessAgeMonths,
              employment_status: "Self-employed",
              loan_purpose: "Business",
              savings_level: cibilScore >= 750 ? "above_1000" : cibilScore >= 650 ? "500_to_1000" : cibilScore >= 550 ? "100_to_500" : "below_100",
            }),
            signal: AbortSignal.timeout(8000),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            usedApi = true;

            // Map API response to the shape the app expects
            data = {
              decision: {
                approved: apiData.approved,
                reasons: [],
                riskCategory: apiData.risk_level,
                riskScore: apiData.risk_score,
                approvalProbability: apiData.approval_probability,
                model: `${apiData.model_name} — ${apiData.dataset}`,
              },
              metrics: {
                loanToRevenueRatio: (loanAmountRequested / monthlyRevenue).toFixed(2),
                emi: apiData.emi,
                emiToIncomeRatio: ((apiData.emi / monthlyRevenue) * 100).toFixed(2),
                interestRate: apiData.interest_rate,
                recommendedLoanAmount: apiData.recommended_loan,
                totalRepayment: apiData.emi * loanTenureMonths,
              },
              insights: {
                cibilStrength: Math.round(((cibilScore - 300) / 600) * 100),
                revenueStrength: Math.min(100, Math.round((annualRevenue / loanAmountRequested) * 10)),
                loanCapacity: Math.min(100, Math.round((apiData.recommended_loan / loanAmountRequested) * 100)),
                riskScore: apiData.approval_probability,
              },
              applicant: {
                name: formData.applicantName,
                age,
                businessType: formData.businessType,
                monthlyRevenue,
                annualRevenue,
                cibilScore,
                loanAmountRequested,
                loanTenureMonths,
                businessAgeMonths,
              },
            };
          }
        } catch (apiErr) {
          console.warn("FastAPI call failed, falling back to local model:", apiErr);
        }
      }

      // ── Fallback: local JS logistic regression ─────────────────
      if (!data) {
        data = assessLoanApplication({
          applicantName: formData.applicantName,
          age, businessType: formData.businessType,
          monthlyRevenue, annualRevenue, existingLoans,
          loanAmountRequested, cibilScore, loanTenureMonths, businessAgeMonths,
        });
      }

      // Store for insights page
      localStorage.setItem("lastAssessment", JSON.stringify(data));

      // ── Save to Firestore (non-blocking) ───────────────────────
      addDoc(collection(db, "loan_applications"), {
        business_name: formData.applicantName,
        applicant_name: formData.applicantName,
        age,
        business_type: formData.businessType,
        cibil_score: cibilScore,
        monthly_revenue: monthlyRevenue,
        annual_revenue: annualRevenue,
        existing_loans: existingLoans,
        loan_amount_requested: loanAmountRequested,
        loan_tenure_months: loanTenureMonths,
        business_age_months: businessAgeMonths,
        assessment_result: data,
        prediction_source: usedApi ? "fastapi_ml" : "local_ml",
        created_at: serverTimestamp(),
      }).then(() => {
        console.log("[Firestore] Application saved successfully.");
      }).catch((err) => {
        console.warn("[Firestore] Save failed (non-critical):", err);
      });

      toast({
        title: "Assessment Complete",
        description: usedApi
          ? "Prediction via ML API. Redirecting to results..."
          : "Prediction via local model. Redirecting to results...",
      });

      navigate("/assessment-results", {
        state: { assessmentResult: data, formData },
      });

    } catch (error) {
      console.error("Assessment error:", error);
      toast({
        title: "Assessment Failed",
        description: "Failed to assess loan application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnnualRevenueSync = (monthlyValue: string) => {
    const monthly = parseFloat(monthlyValue) || 0;
    handleInputChange("monthlyRevenue", monthlyValue);
    handleInputChange("annualRevenue", (monthly * 12).toString());
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg animate-scale-in overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-accent" />
              Loan Application Form
            </CardTitle>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              {apiStatus === "checking" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Connecting...
                </Badge>
              )}
              {apiStatus === "online" && (
                <Badge className="text-xs gap-1 bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/20">
                  <Wifi className="w-3 h-3" /> UCI Model Online
                </Badge>
              )}
              {apiStatus === "offline" && (
                <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-500/30">
                  <WifiOff className="w-3 h-3" /> Local Model
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Powered by Random Forest trained on the UCI German Credit Dataset (1,000 real bank applicants)
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name</Label>
                  <Input
                    id="applicantName"
                    placeholder="John Doe"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange("applicantName", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (Years)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="80"
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cibilScore">CIBIL Score (300-900)</Label>
                  <Input
                    id="cibilScore"
                    type="number"
                    min="300"
                    max="900"
                    placeholder="750"
                    value={formData.cibilScore}
                    onChange={(e) => handleInputChange("cibilScore", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Building2 className="w-4 h-4" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange("businessType", value)}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-accent/20">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAgeMonths">Business Age (Months)</Label>
                  <Input
                    id="businessAgeMonths"
                    type="number"
                    min="0"
                    placeholder="24"
                    value={formData.businessAgeMonths}
                    onChange={(e) => handleInputChange("businessAgeMonths", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <IndianRupee className="w-4 h-4" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyRevenue">Monthly Revenue (₹)</Label>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    step="1000"
                    placeholder="500000"
                    value={formData.monthlyRevenue}
                    onChange={(e) => handleAnnualRevenueSync(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue (₹)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    step="10000"
                    placeholder="6000000"
                    value={formData.annualRevenue}
                    onChange={(e) => handleInputChange("annualRevenue", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingLoans">Existing Loans (₹)</Label>
                  <Input
                    id="existingLoans"
                    type="number"
                    step="1000"
                    placeholder="0"
                    value={formData.existingLoans}
                    onChange={(e) => handleInputChange("existingLoans", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <CreditCard className="w-4 h-4" />
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmountRequested">Loan Amount Needed (₹)</Label>
                  <Input
                    id="loanAmountRequested"
                    type="number"
                    step="10000"
                    placeholder="1000000"
                    value={formData.loanAmountRequested}
                    onChange={(e) => handleInputChange("loanAmountRequested", e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTenureMonths" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Loan Tenure (Months)
                  </Label>
                  <Select
                    value={formData.loanTenureMonths}
                    onValueChange={(value) => handleInputChange("loanTenureMonths", value)}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-accent/20">
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 Months (1 Year)</SelectItem>
                      <SelectItem value="24">24 Months (2 Years)</SelectItem>
                      <SelectItem value="36">36 Months (3 Years)</SelectItem>
                      <SelectItem value="48">48 Months (4 Years)</SelectItem>
                      <SelectItem value="60">60 Months (5 Years)</SelectItem>
                      <SelectItem value="84">84 Months (7 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-300 shadow-lg hover:shadow-xl" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Application...
                </>
              ) : (
                "Check Loan Eligibility"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
