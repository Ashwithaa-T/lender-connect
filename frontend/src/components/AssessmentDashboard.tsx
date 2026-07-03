import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

const AssessmentDashboard = () => {
  const metrics = [
    { label: "CIBIL Score", value: 782, max: 900, status: "excellent", trend: "+12" },
    { label: "Debt-to-Income Ratio", value: 32, max: 100, status: "good", trend: "-5%" },
    { label: "Repayment History", value: 94, max: 100, status: "excellent", trend: "+3%" },
    { label: "Credit Utilization", value: 28, max: 100, status: "good", trend: "-8%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-secondary";
      case "good":
        return "text-accent";
      case "fair":
        return "text-yellow-600";
      default:
        return "text-destructive";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Excellent</Badge>;
      case "good":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Good</Badge>;
      default:
        return <Badge variant="outline">Fair</Badge>;
    }
  };

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Live Assessment Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time creditworthiness evaluation for informed lending decisions
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="p-8 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Assessment Result</h3>
                <p className="text-muted-foreground">Application ID: #SB-2024-1847</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
                <div>
                  <Badge className="bg-secondary text-secondary-foreground mb-1">APPROVED</Badge>
                  <div className="text-sm text-muted-foreground">Risk Score: Low</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Credit Metrics
                </h4>
                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(metric.status)}
                        <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                          {metric.value}
                          {metric.label === "CIBIL Score" ? "" : "%"}
                        </span>
                        <span className={`text-xs ${metric.trend.startsWith("+") ? "text-secondary" : "text-destructive"}`}>
                          {metric.trend.startsWith("+") ? (
                            <TrendingUp className="w-4 h-4 inline" />
                          ) : (
                            <TrendingDown className="w-4 h-4 inline" />
                          )}
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                    <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  Key Insights
                </h4>
                <div className="space-y-4">
                  {[
                    { type: "positive", text: "Strong repayment history with no defaults in the last 36 months" },
                    { type: "positive", text: "Steady business revenue growth of 23% year-over-year" },
                    { type: "neutral", text: "3 active loans with total outstanding of ₹8.5L" },
                    { type: "positive", text: "Excellent credit mix with secured and unsecured debt" },
                  ].map((insight, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50 border border-border">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === "positive" ? "bg-secondary" : 
                        insight.type === "neutral" ? "bg-accent" : "bg-destructive"
                      }`} />
                      <p className="text-sm text-muted-foreground flex-1">{insight.text}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="font-semibold text-secondary">Recommendation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Approve loan up to <span className="font-bold text-foreground">₹15,00,000</span> at competitive interest rate. Customer shows strong creditworthiness and low default risk.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Loan Amount Requested", value: "₹12,00,000", subtext: "Working capital" },
              { label: "Monthly Revenue", value: "₹4,50,000", subtext: "Average (6 months)" },
              { label: "Business Age", value: "4.5 years", subtext: "Registered since 2019" },
            ].map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-all duration-300">
                <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                <div className="text-2xl font-bold mb-1">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.subtext}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssessmentDashboard;
