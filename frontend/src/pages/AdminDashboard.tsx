import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ArrowLeft, LogOut, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { LoanAnalytics } from "@/components/LoanAnalytics";

interface LoanApplication {
  id: string;
  applicant_name: string | null;
  business_name: string;
  business_type: string | null;
  cibil_score: number;
  monthly_revenue: number;
  loan_amount_requested: number;
  assessment_result: any;
  created_at: any;
}

const SAMPLE_DEMO_APPLICATIONS: LoanApplication[] = [
  {
    id: "demo-sample-1",
    applicant_name: "Demo Applicant A (Sample)",
    business_name: "Urban Logistics Ltd",
    business_type: "Logistics",
    cibil_score: 775,
    monthly_revenue: 350000,
    loan_amount_requested: 1000000,
    created_at: new Date(Date.now() - 3600000),
    assessment_result: {
      decision: {
        approved: true,
        riskCategory: "Low Risk",
        approvalProbability: 82,
        model: "Random Forest — UCI German Credit",
      },
      metrics: { interestRate: 12.0, emi: 47000 },
      risk_category: "Low Risk",
    },
  },
  {
    id: "demo-sample-2",
    applicant_name: "Demo Applicant B (Sample)",
    business_name: "Heritage Crafts Emporium",
    business_type: "Retail",
    cibil_score: 660,
    monthly_revenue: 180000,
    loan_amount_requested: 600000,
    created_at: new Date(Date.now() - 7200000),
    assessment_result: {
      decision: {
        approved: true,
        riskCategory: "Moderate Risk",
        approvalProbability: 64,
        model: "Random Forest — UCI German Credit",
      },
      metrics: { interestRate: 14.5, emi: 29500 },
      risk_category: "Moderate Risk",
    },
  },
  {
    id: "demo-sample-3",
    applicant_name: "Demo Applicant C (Sample)",
    business_name: "Apex Tech Services",
    business_type: "Technology",
    cibil_score: 580,
    monthly_revenue: 95000,
    loan_amount_requested: 500000,
    created_at: new Date(Date.now() - 14400000),
    assessment_result: {
      decision: {
        approved: false,
        riskCategory: "High Risk",
        approvalProbability: 36,
        model: "Random Forest — UCI German Credit",
      },
      metrics: { interestRate: 18.0, emi: 27200 },
      risk_category: "High Risk",
    },
  },
];

const AdminDashboard = () => {
  const getStoredLocalApps = (): LoanApplication[] => {
    try {
      const stored = localStorage.getItem("stored_loan_applications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const mergeApplications = (cloudApps: LoanApplication[], localApps: LoanApplication[]): LoanApplication[] => {
    const merged = [...cloudApps];
    for (const loc of localApps) {
      if (!merged.some(c => c.id === loc.id || (c.applicant_name === loc.applicant_name && c.loan_amount_requested === loc.loan_amount_requested))) {
        merged.unshift(loc);
      }
    }
    return merged;
  };

  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const isDemoParam = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true";
  const isGuestDemo = typeof window !== "undefined" && sessionStorage.getItem("isDemoAdmin") === "true";
  const isPrimaryAdmin = user?.email === "tera.ashwithaareddy@gmail.com";
  const isDemoMode = !isPrimaryAdmin || isDemoParam || isGuestDemo;

  // Initialize: Primary admin gets real local applications; only explicit demo guests start with sample data
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    if (isDemoParam || isGuestDemo) return SAMPLE_DEMO_APPLICATIONS;
    return getStoredLocalApps();
  });
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const sortApplications = (list: LoanApplication[]): LoanApplication[] => {
    return [...list].sort((a, b) => {
      const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
      const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
  };

  const fetchApplications = async () => {
    setLoading(true);
    setAccessDenied(false);

    // In demo mode: only show sample data, protect real applicant data
    if (isDemoMode) {
      setApplications(SAMPLE_DEMO_APPLICATIONS);
      setLoading(false);
      return;
    }

    const localApps = getStoredLocalApps();

    if (!db) {
      setApplications(sortApplications(mergeApplications([], localApps)));
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "loan_applications"), limit(50));
      const querySnapshot = await getDocs(q);
      const cloudData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoanApplication[];
      setApplications(sortApplications(mergeApplications(cloudData, localApps)));
    } catch (error) {
      console.warn("Firestore query note, serving persistent local records:", error);
      setApplications(sortApplications(mergeApplications([], localApps)));
    }
    setLoading(false);
  };

  useEffect(() => {
    // Wait until Firebase Auth has checked user session before determining mode
    if (authLoading) return;

    if (isDemoMode) {
      setApplications(SAMPLE_DEMO_APPLICATIONS);
      setLoading(false);
      return;
    }

    // PRIMARY ADMIN ONLY: Real applications ONLY (never include sample records)
    const local = getStoredLocalApps();
    setApplications(sortApplications(mergeApplications([], local)));

    let unsubscribeFirestore: (() => void) | null = null;
    if (db) {
      try {
        const q = query(collection(db, "loan_applications"), limit(50));
        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const cloudData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoanApplication[];
            const freshLocal = getStoredLocalApps();
            // Pure merge of cloud + local, completely free of any demo sample records
            setApplications(sortApplications(mergeApplications(cloudData, freshLocal)));
            setLoading(false);
          },
          (err) => {
            console.warn("[Firestore] Real-time listener note:", err);
            const freshLocal = getStoredLocalApps();
            setApplications(sortApplications(mergeApplications([], freshLocal)));
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn("[Firestore] Listener setup note:", err);
      }
    }

    const handleNewApplication = () => {
      const freshLocal = getStoredLocalApps();
      setApplications(prev => {
        // Strip any sample records and strictly merge real applications
        const cleanPrev = prev.filter(a => !a.id.startsWith("demo-sample-"));
        return sortApplications(mergeApplications(cleanPrev, freshLocal));
      });
    };

    window.addEventListener("loan_application_submitted", handleNewApplication);
    window.addEventListener("storage", handleNewApplication);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("lender_connect_apps");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "APPLICATION_SUBMITTED") {
            handleNewApplication();
          }
        };
      } catch (e) {
        // ignore BroadcastChannel errors
      }
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener("loan_application_submitted", handleNewApplication);
      window.removeEventListener("storage", handleNewApplication);
      if (channel) {
        channel.close();
      }
    };
  }, [user, isDemoMode, authLoading]);

  const getRiskBadge = (result: any) => {
    const rawCategory =
      result?.decision?.riskCategory ||
      result?.decision?.risk_category ||
      result?.decision?.risk_level ||
      result?.riskCategory ||
      result?.risk_category ||
      result?.risk_level ||
      (result?.decision?.approved === true ? "Low Risk" : result?.decision?.approved === false ? "High Risk" : null);

    if (!rawCategory) return <Badge variant="outline">Pending</Badge>;

    let category = String(rawCategory).trim();
    if (category.toLowerCase() === "low" || category.toLowerCase() === "low risk") category = "Low Risk";
    else if (category.toLowerCase() === "medium" || category.toLowerCase() === "moderate" || category.toLowerCase() === "moderate risk") category = "Moderate Risk";
    else if (category.toLowerCase() === "high" || category.toLowerCase() === "high risk") category = "High Risk";

    const colors: Record<string, string> = {
      "Low Risk": "bg-green-500/20 text-green-400 border-green-500/30",
      "Moderate Risk": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "High Risk": "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <Badge className={colors[category] || "bg-primary/20 text-primary border-primary/30"} variant="outline">
        {category}
      </Badge>
    );
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("isDemoAdmin");
    if (user) {
      await signOut();
    }
    navigate("/login");
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <Card className="max-w-md w-full border-destructive/30 bg-card">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground">
                You do not have permission to view this page. Only authorized administrators can access the dashboard.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Evaluator Preview Mode Alert Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Evaluator Preview Mode
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                    Sample Data
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  Displaying anonymized sample portfolio for evaluation. Real applicant data is private to the primary administrator.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs shrink-0 border-primary/30 hover:bg-primary/20"
            >
              Exit Preview
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                Admin Dashboard
                {isDemoMode ? (
                  <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">
                    Demo Mode
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">
                    Live Production
                  </Badge>
                )}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> {isDemoMode ? "Exit Preview" : "Sign Out"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="applications">Applicants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Applicants
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : applications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No loan applications submitted yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>CIBIL</TableHead>
                          <TableHead>Loan Amount</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium text-foreground">
                              {app.applicant_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {app.business_name}
                            </TableCell>
                            <TableCell className="text-foreground">{app.cibil_score}</TableCell>
                            <TableCell className="text-foreground">
                              ₹{Number(app.loan_amount_requested).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-foreground">
                              ₹{Number(app.monthly_revenue).toLocaleString()}/mo
                            </TableCell>
                            <TableCell>{getRiskBadge(app.assessment_result)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {app.created_at?.toDate 
                                ? app.created_at.toDate().toLocaleDateString() 
                                : new Date(app.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <LoanAnalytics customApplications={applications} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
