import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface LoanApplication {
  cibil_score: number;
  loan_amount_requested: number;
  monthly_revenue: number;
  existing_loans: number;
  created_at: any;
}

export const LoanAnalytics = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, "loan_applications"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as LoanApplication);
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionStats = () => {
    const stats = { approved: 0, review: 0, rejected: 0 };
    
    applications.forEach((app) => {
      const debtRatio = (app.existing_loans / app.monthly_revenue) * 100;
      const loanRatio = app.loan_amount_requested / app.monthly_revenue;
      
      if (app.cibil_score >= 750 && debtRatio < 40 && loanRatio < 2) {
        stats.approved++;
      } else if (app.cibil_score >= 650 && debtRatio < 50 && loanRatio < 3) {
        stats.review++;
      } else {
        stats.rejected++;
      }
    });

    return [
      { name: "Approved", value: stats.approved, color: "#10b981" },
      { name: "Under Review", value: stats.review, color: "#f59e0b" },
      { name: "Rejected", value: stats.rejected, color: "#ef4444" },
    ];
  };

  const getLoanRanges = () => {
    const ranges = {
      "0-5L": 0,
      "5-10L": 0,
      "10-25L": 0,
      "25L+": 0,
    };

    applications.forEach((app) => {
      const amount = app.loan_amount_requested / 100000; // Convert to lakhs
      if (amount <= 5) ranges["0-5L"]++;
      else if (amount <= 10) ranges["5-10L"]++;
      else if (amount <= 25) ranges["10-25L"]++;
      else ranges["25L+"]++;
    });

    return [
      { range: "0-5L", count: ranges["0-5L"] },
      { range: "5-10L", count: ranges["5-10L"] },
      { range: "10-25L", count: ranges["10-25L"] },
      { range: "25L+", count: ranges["25L+"] },
    ];
  };

  const getCibilDistribution = () => {
    const distribution = {
      "300-549": 0,
      "550-649": 0,
      "650-749": 0,
      "750-900": 0,
    };

    applications.forEach((app) => {
      if (app.cibil_score < 550) distribution["300-549"]++;
      else if (app.cibil_score < 650) distribution["550-649"]++;
      else if (app.cibil_score < 750) distribution["650-749"]++;
      else distribution["750-900"]++;
    });

    return [
      { range: "300-549", count: distribution["300-549"], label: "Poor" },
      { range: "550-649", count: distribution["550-649"], label: "Fair" },
      { range: "650-749", count: distribution["650-749"], label: "Good" },
      { range: "750-900", count: distribution["750-900"], label: "Excellent" },
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decisionStats = getDecisionStats();
  const loanRanges = getLoanRanges();
  const cibilDistribution = getCibilDistribution();
  const totalApplications = applications.length;
  const approvalRate = totalApplications > 0 ? ((decisionStats[0].value / totalApplications) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold text-foreground">{approvalRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-secondary">{decisionStats[0].value}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-amber-400">{decisionStats[1].value}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-400/10">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Distribution */}
        <Card className="animate-scale-in bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Loan Decision Distribution</CardTitle>
            <CardDescription>Breakdown of application outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={decisionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  stroke="transparent"
                  paddingAngle={3}
                >
                  {decisionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 9%)',
                    border: '1px solid hsl(217 33% 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 98%)'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${totalApplications > 0 ? ((value / totalApplications) * 100).toFixed(1) : 0}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {decisionStats.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}
                    <span className="ml-1 font-semibold text-foreground">
                      {entry.value}
                      {totalApplications > 0 && (
                        <span className="text-muted-foreground font-normal">
                          {" "}({((entry.value / totalApplications) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loan Amount Distribution */}
        <Card className="animate-scale-in bg-card/50 border-border/50 backdrop-blur-sm" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="text-foreground">Loan Amount Distribution</CardTitle>
            <CardDescription>Applications by loan range (in lakhs)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loanRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                <XAxis dataKey="range" stroke="hsl(215 20% 65%)" />
                <YAxis stroke="hsl(215 20% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222 47% 9%)', 
                    border: '1px solid hsl(217 33% 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 98%)'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CIBIL Score Distribution */}
        <Card className="animate-scale-in lg:col-span-2 bg-card/50 border-border/50 backdrop-blur-sm" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-foreground">CIBIL Score Distribution</CardTitle>
            <CardDescription>Credit score ranges of applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cibilDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                <XAxis dataKey="range" stroke="hsl(215 20% 65%)" />
                <YAxis stroke="hsl(215 20% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222 47% 9%)', 
                    border: '1px solid hsl(217 33% 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 98%)'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(199 89% 48%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
