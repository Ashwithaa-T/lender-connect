import Navigation from "@/components/Navigation";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, TrendingUp, CreditCard, DollarSign, PieChart, Building2, Brain, CheckCircle, Lock, FileText } from "lucide-react";

const Index = () => {
  const howItWorksSteps = [
    {
      icon: FileText,
      title: "Submit Details",
      description: "Enter applicant and financial data including CIBIL score, transaction history, and business information."
    },
    {
      icon: Brain,
      title: "AI Evaluation",
      description: "Our AI analyzes credit risk and eligibility factors in real-time using advanced algorithms."
    },
    {
      icon: CheckCircle,
      title: "Instant Insights",
      description: "Receive approval insights with risk classification and actionable recommendations."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] animate-float opacity-20">
            <CreditCard className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute top-40 right-[15%] animate-float-delayed opacity-20">
            <DollarSign className="w-12 h-12 text-accent" />
          </div>
          <div className="absolute bottom-40 left-[20%] animate-float opacity-15">
            <PieChart className="w-20 h-20 text-secondary" />
          </div>
          <div className="absolute top-60 left-[5%] animate-float-slow opacity-10">
            <Building2 className="w-24 h-24 text-primary" />
          </div>
          <div className="absolute bottom-20 right-[10%] animate-float-delayed opacity-15">
            <TrendingUp className="w-14 h-14 text-accent" />
          </div>
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4 animate-pulse" />
            Secure & Compliant Lending Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Smart Loan Assessment for{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Small Businesses
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            AI-driven insights to evaluate creditworthiness based on CIBIL scores, transaction history, and financial metrics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <NavLink to="/apply">
              <Button variant="cta" size="lg" className="group">
                Start Loan Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </NavLink>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View How It Works
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-primary group-hover:scale-110 transition-transform">99.2%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center border-x border-border group">
              <div className="text-2xl md:text-3xl font-bold text-accent">
                <Zap className="w-6 h-6 mx-auto group-hover:animate-bounce" />
              </div>
              <div className="text-xs text-muted-foreground">Real-Time</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-secondary">
                <TrendingUp className="w-6 h-6 mx-auto group-hover:animate-bounce" />
              </div>
              <div className="text-xs text-muted-foreground">Bank-Grade</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            Accuracy based on historical evaluation simulations.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 animate-fade-in">
            How LendAssess Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="relative text-center animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute top-8 left-[60%] hidden md:block w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" 
                  style={{ display: index === howItWorksSteps.length - 1 ? 'none' : undefined }} 
                />
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <div className="p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Security & Compliance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">Secure data handling and encryption</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">Conceptual compliance with lending evaluation standards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">LendAssess</span>
            <span className="text-muted-foreground">© 2026</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            AI-powered loan assessment for small businesses
          </p>
          <p className="text-xs text-muted-foreground/60">
            This is a prototype / academic demonstration
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;