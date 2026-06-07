import Navigation from "@/components/Navigation";
import { LoanAnalytics } from "@/components/LoanAnalytics";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ArrowLeft } from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <NavLink to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </NavLink>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Loan Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            View comprehensive analytics and insights on loan applications
          </p>
        </div>
        <LoanAnalytics />
      </div>
    </div>
  );
};

export default Analytics;