import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, RefreshCw } from "lucide-react";

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

const ReviewApplications = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "loan_applications"), orderBy("created_at", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoanApplication[];
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getRiskBadge = (result: any) => {
    if (!result?.risk_category) return <Badge variant="outline">Pending</Badge>;
    const colors: Record<string, string> = {
      "Low Risk": "bg-green-500/20 text-green-400 border-green-500/30",
      "Moderate Risk": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "High Risk": "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={colors[result.risk_category] || ""} variant="outline">
        {result.risk_category}
      </Badge>
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Review Applications</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Last 10 Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No applications found.</p>
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
      </div>
    </div>
  );
};

export default ReviewApplications;
