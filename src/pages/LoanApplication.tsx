import Navigation from "@/components/Navigation";
import { LoanAssessmentForm } from "@/components/LoanAssessmentForm";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { FileText, ArrowLeft } from "lucide-react";

const LoanApplication = () => {
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

        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            New Application
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Loan Application
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your business details to get an AI-powered lending decision with detailed analytics and risk assessment.
          </p>
        </div>
        
        <LoanAssessmentForm />
      </div>

      <Footer />
    </div>
  );
};

export default LoanApplication;